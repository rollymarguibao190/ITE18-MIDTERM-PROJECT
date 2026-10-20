import { mkdir, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { TourPackage } from '~~/types';

const DATA_DIR = join(process.cwd(), 'server', 'data');
const FILE = join(DATA_DIR, 'packages.json');

function ensureDataDirSync() {
  mkdir(DATA_DIR, { recursive: true }, () => {});
}

export function getPackages(): TourPackage[] {
  try {
    return JSON.parse(readFileSync(FILE, 'utf-8')) as TourPackage[];
  } catch {
    return [];
  }
}

export function getPackageById(id: string): TourPackage | undefined {
  return getPackages().find((p) => p.id === id);
}

export function getPackagesByDestination(destinationId: string): TourPackage[] {
  return getPackages().filter((p) => p.destinationId === destinationId);
}

export async function createPackage(input: Omit<TourPackage, 'id'>): Promise<TourPackage> {
  const items = getPackages();
  const pkg: TourPackage = { ...input, id: randomUUID() };
  items.push(pkg);
  ensureDataDirSync();
  writeFileSync(FILE, JSON.stringify(items, null, 2), 'utf-8');
  return pkg;
}

export async function updatePackage(id: string, patch: Partial<Omit<TourPackage, 'id'>>): Promise<TourPackage | null> {
  const items = getPackages();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch, id };
  ensureDataDirSync();
  writeFileSync(FILE, JSON.stringify(items, null, 2), 'utf-8');
  return items[idx];
}

export async function deletePackage(id: string): Promise<boolean> {
  const items = getPackages();
  const next = items.filter((p) => p.id !== id);
  if (next.length === items.length) return false;
  ensureDataDirSync();
  writeFileSync(FILE, JSON.stringify(next, null, 2), 'utf-8');
  return true;
}
