import { deleteDestination, getDestinationById } from '../../../utils/destinations';
import { requireRole } from '../../../utils/session';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin');
  const id = getRouterParam(event, 'id') || '';
  const existing = getDestinationById(id);
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Destination not found.' });
  await deleteDestination(id);
  return { ok: true };
});
