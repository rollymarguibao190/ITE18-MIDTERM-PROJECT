import type { TourPackage } from '~~/types';

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || '';
  const destination = getDestinationById(id);
  if (!destination) {
    throw createError({ statusCode: 404, statusMessage: 'Destination not found' });
  }
  const packages: TourPackage[] = getPackagesByDestination(id);
  return { destination, packages };
});
