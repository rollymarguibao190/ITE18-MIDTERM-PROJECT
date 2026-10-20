import { getAllBookings } from '../../utils/bookings';
import { requireRole } from '../../utils/session';
import { getPackages } from '../../utils/packages';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'operator', 'admin');
  const [bookings, packages] = await Promise.all([getAllBookings(), getPackages()]);

  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const revenue = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);

  return {
    packages: packages.length,
    bookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    confirmedBookings: confirmed.length,
    cancelledBookings: bookings.filter((b) => b.status === 'cancelled').length,
    revenue,
  };
});
