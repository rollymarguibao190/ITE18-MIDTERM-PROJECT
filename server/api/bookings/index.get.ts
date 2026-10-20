import { getBookingsByUser } from '../../utils/bookings';
import { requireUser } from '../../utils/session';
import type { Booking } from '~~/types';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const bookings: Booking[] = await getBookingsByUser(user.id);
  return { bookings };
});
