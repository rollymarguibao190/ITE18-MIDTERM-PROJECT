import { updateBookingStatus } from '../../../utils/bookings';
import { requireRole } from '../../../utils/session';
import type { BookingStatus } from '~~/types';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin');
  const id = getRouterParam(event, 'id') || '';
  const body = await readBody<{ status?: BookingStatus }>(event);
  const status = body?.status;

  if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid status.' });
  }

  const booking = await updateBookingStatus(id, status);
  if (!booking) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found.' });
  }
  return { booking };
});
