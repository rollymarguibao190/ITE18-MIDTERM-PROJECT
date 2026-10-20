import { createBooking } from '../../utils/bookings';
import { requireUser } from '../../utils/session';
import { getPackageById } from '../../utils/packages';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const body = await readBody<{
    packageId?: string;
    travelDate?: string;
    travelers?: number;
  }>(event);

  const packageId = (body?.packageId || '').trim();
  const travelDate = (body?.travelDate || '').trim();
  const travelers = Number(body?.travelers) || 0;

  if (!packageId) {
    throw createError({ statusCode: 400, statusMessage: 'Package is required.' });
  }
  if (!travelDate) {
    throw createError({ statusCode: 400, statusMessage: 'Travel date is required.' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(travelDate)) {
    throw createError({ statusCode: 400, statusMessage: 'Travel date must be in YYYY-MM-DD format.' });
  }
  if (travelers < 1 || travelers > 20) {
    throw createError({ statusCode: 400, statusMessage: 'Travelers must be between 1 and 20.' });
  }

  const pkg = getPackageById(packageId);
  if (!pkg) {
    throw createError({ statusCode: 404, statusMessage: 'Selected package not found.' });
  }

  const today = new Date().toISOString().split('T')[0];
  if (travelDate < today) {
    throw createError({ statusCode: 400, statusMessage: 'Travel date cannot be in the past.' });
  }

  const booking = await createBooking({
    userId: user.id,
    packageId: pkg.id,
    packageName: pkg.name,
    travelDate,
    travelers,
    unitPrice: pkg.price,
  });

  return { booking };
});
