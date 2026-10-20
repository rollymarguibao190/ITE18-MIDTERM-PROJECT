import { mkdir, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Destination } from '~~/types';

const DATA_DIR = join(process.cwd(), 'server', 'data');
const FILE = join(DATA_DIR, 'destinations.json');

function ensureDataDirSync() {
  mkdir(DATA_DIR, { recursive: true }, () => {});
}

export function getDestinations(): Destination[] {
  try {
    return JSON.parse(readFileSync(FILE, 'utf-8')) as Destination[];
  } catch {
    return [];
  }
}

export function getDestinationById(id: string): Destination | undefined {
  return getDestinations().find((d) => d.id === id);
}

export async function createDestination(input: Omit<Destination, 'id'>): Promise<Destination> {
  const items = getDestinations();
  const dest: Destination = { ...input, id: randomUUID() };
  items.push(dest);
  ensureDataDirSync();
  writeFileSync(FILE, JSON.stringify(items, null, 2), 'utf-8');
  return dest;
}

export async function updateDestination(id: string, patch: Partial<Omit<Destination, 'id'>>): Promise<Destination | null> {
  const items = getDestinations();
  const idx = items.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch, id };
  ensureDataDirSync();
  writeFileSync(FILE, JSON.stringify(items, null, 2), 'utf-8');
  return items[idx];
}

export async function deleteDestination(id: string): Promise<boolean> {
  const items = getDestinations();
  const next = items.filter((d) => d.id !== id);
  if (next.length === items.length) return false;
  ensureDataDirSync();
  writeFileSync(FILE, JSON.stringify(next, null, 2), 'utf-8');
  return true;
}
