import { randomUUID } from 'node:crypto';
import type { H3Event } from 'h3';
import {
  getSessions,
  saveSessions,
  findUserById,
  toPublicUser,
  type SessionRecord,
  type StoredUser,
} from './auth';

const SESSION_COOKIE = 'ct_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function createSession(event: H3Event, user: StoredUser) {
  const token = randomUUID();
  const sessions = await getSessions();
  sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  await saveSessions(sessions);

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
  return token;
}

export async function destroySession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE);
  if (token) {
    const sessions = await getSessions();
    await saveSessions(sessions.filter((s: SessionRecord) => s.token !== token));
  }
  deleteCookie(event, SESSION_COOKIE, { path: '/' });
}

export async function getSessionUser(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE);
  if (!token) return null;
  const sessions = await getSessions();
  const record = sessions.find((s) => s.token === token);
  if (!record) return null;
  const user = await findUserById(record.userId);
  return user ? toPublicUser(user) : null;
}

export async function requireUser(event: H3Event) {
  const user = await getSessionUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
  }
  return user;
}

export async function requireRole(event: H3Event, ...roles: Array<'customer' | 'operator' | 'admin'>) {
  const user = await requireUser(event);
  if (!roles.includes(user.role)) {
    throw createError({ statusCode: 403, statusMessage: 'Not authorized' });
  }
  return user;
}
