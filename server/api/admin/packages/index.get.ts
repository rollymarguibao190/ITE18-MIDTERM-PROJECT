import { getPackages } from '../../../utils/packages';
import { requireRole } from '../../../utils/session';
import type { TourPackage } from '~~/types';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin');
  const packages: TourPackage[] = getPackages();
  return { packages };
});
