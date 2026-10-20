import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const DATA_DIR = join(process.cwd(), 'server', 'data');
const USERS_FILE = join(DATA_DIR, 'users.json');
const SESSIONS_FILE = join(DATA_DIR, 'sessions.json');

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'operator' | 'admin';
  createdAt: string;
}

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const fs = await import('node:fs/promises');
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await ensureDataDir();
  const fs = await import('node:fs/promises');
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getUsers(): Promise<StoredUser[]> {
  return readJson<StoredUser[]>(USERS_FILE, []);
}

export async function saveUsers(users: StoredUser[]) {
  await writeJson(USERS_FILE, users);
}

export async function getSessions(): Promise<SessionRecord[]> {
  return readJson<SessionRecord[]>(SESSIONS_FILE, []);
}

export async function saveSessions(sessions: SessionRecord[]) {
  await writeJson(SESSIONS_FILE, sessions);
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const users = await getUsers();
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

export async function findUserById(id: string): Promise<StoredUser | undefined> {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: StoredUser['role'] = 'customer',
): Promise<StoredUser> {
  const users = await getUsers();
  if (await findUserByEmail(email)) {
    throw new Error('EMAIL_TAKEN');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user: StoredUser = {
    id: randomUUID(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    role,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await saveUsers(users);
  return user;
}

export async function verifyPassword(user: StoredUser, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

export function toPublicUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function toPublicUserWithDate(user: StoredUser) {
  return {
    ...toPublicUser(user),
    createdAt: user.createdAt,
  };
}
