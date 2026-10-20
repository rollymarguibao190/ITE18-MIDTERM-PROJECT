import { getDestinations } from '../../../utils/destinations';
import { requireRole } from '../../../utils/session';
import type { Destination } from '~~/types';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin');
  const destinations: Destination[] = getDestinations();
  return { destinations };
});
