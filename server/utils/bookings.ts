import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Booking, BookingStatus } from '~~/types';

const DATA_DIR = join(process.cwd(), 'server', 'data');
const BOOKINGS_FILE = join(DATA_DIR, 'bookings.json');

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readBookings(): Promise<Booking[]> {
  try {
    const fs = await import('node:fs/promises');
    const raw = await fs.readFile(BOOKINGS_FILE, 'utf-8');
    return JSON.parse(raw) as Booking[];
  } catch {
    return [];
  }
}

async function writeBookings(bookings: Booking[]) {
  await ensureDataDir();
  const fs = await import('node:fs/promises');
  await fs.writeFile(BOOKINGS_FILE, JSON.stringify(bookings, null, 2), 'utf-8');
}

export async function getAllBookings(): Promise<Booking[]> {
  return readBookings();
}

export async function getBookingsByUser(userId: string): Promise<Booking[]> {
  const all = await readBookings();
  return all.filter((b) => b.userId === userId);
}

export async function createBooking(input: {
  userId: string;
  packageId: string;
  packageName: string;
  travelDate: string;
  travelers: number;
  unitPrice: number;
}): Promise<Booking> {
  const bookings = await readBookings();
  const booking: Booking = {
    id: randomUUID(),
    userId: input.userId,
    packageId: input.packageId,
    packageName: input.packageName,
    travelDate: input.travelDate,
    travelers: input.travelers,
    totalPrice: input.unitPrice * input.travelers,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  await writeBookings(bookings);
  return booking;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
  ownerId?: string,
): Promise<Booking | null> {
  const bookings = await readBookings();
  const idx = bookings.findIndex((b) => b.id === id && (!ownerId || b.userId === ownerId));
  if (idx === -1) return null;
  bookings[idx] = { ...bookings[idx], status };
  await writeBookings(bookings);
  return bookings[idx];
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
  const all = await readBookings();
  return all.find((b) => b.id === id);
}
