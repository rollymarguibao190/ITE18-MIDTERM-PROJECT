import { getUsers, toPublicUserWithDate } from '../../utils/auth';
import { requireRole } from '../../utils/session';
import { getDestinations } from '../../utils/destinations';
import { getPackages } from '../../utils/packages';
import { getAllBookings } from '../../utils/bookings';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin');
  const [users, destinations, packages, bookings] = await Promise.all([
    getUsers(),
    getDestinations(),
    getPackages(),
    getAllBookings(),
  ]);

  const confirmed = bookings.filter((b) => b.status === 'confirmed');
  const revenue = confirmed.reduce((sum, b) => sum + b.totalPrice, 0);

  return {
    users: users.length,
    destinations: destinations.length,
    packages: packages.length,
    bookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    confirmedBookings: confirmed.length,
    cancelledBookings: bookings.filter((b) => b.status === 'cancelled').length,
    revenue,
    recentUsers: users
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
      .map(toPublicUserWithDate),
  };
});
