import { updateBookingStatus } from '../../utils/bookings';
import { requireUser } from '../../utils/session';
import type { BookingStatus } from '~~/types';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);
  const id = getRouterParam(event, 'id') || '';
  const body = await readBody<{ status?: BookingStatus }>(event);
  const status = body?.status;

  if (status !== 'cancelled') {
    throw createError({ statusCode: 400, statusMessage: 'Customers can only cancel bookings.' });
  }

  const booking = await updateBookingStatus(id, 'cancelled', user.id);
  if (!booking) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found.' });
  }
  return { booking };
});
