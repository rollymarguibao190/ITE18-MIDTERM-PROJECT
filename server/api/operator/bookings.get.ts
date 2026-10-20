import { getAllBookings } from '../../utils/bookings';
import { requireRole } from '../../utils/session';
import type { Booking } from '~~/types';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'operator', 'admin');
  const bookings: Booking[] = await getAllBookings();
  return { bookings };
});
