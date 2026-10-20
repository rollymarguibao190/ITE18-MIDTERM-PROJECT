import { deletePackage, getPackageById } from '../../../utils/packages';
import { requireRole } from '../../../utils/session';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin');
  const id = getRouterParam(event, 'id') || '';
  const existing = getPackageById(id);
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Package not found.' });
  await deletePackage(id);
  return { ok: true };
});
