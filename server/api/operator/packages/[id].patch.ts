import { updatePackage } from '../../../utils/packages';
import { getDestinationById } from '../../../utils/destinations';
import { requireRole } from '../../../utils/session';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'operator', 'admin');
  const id = getRouterParam(event, 'id') || '';
  const body = await readBody<{
    name?: string;
    destinationId?: string;
    durationDays?: number;
    price?: number;
    image?: string;
    description?: string;
    includes?: string[];
  }>(event);

  const patch: Record<string, unknown> = {};
  if (body?.name !== undefined) patch.name = body.name.trim();
  if (body?.description !== undefined) patch.description = body.description.trim();
  if (body?.image !== undefined) patch.image = body.image.trim();
  if (body?.includes !== undefined) {
    patch.includes = Array.isArray(body.includes) ? body.includes.map((i: string) => i.trim()).filter(Boolean) : [];
  }
  if (body?.durationDays !== undefined) patch.durationDays = Number(body.durationDays);
  if (body?.price !== undefined) patch.price = Number(body.price);
  if (body?.destinationId !== undefined) {
    const dest = getDestinationById(body.destinationId);
    if (!dest) throw createError({ statusCode: 400, statusMessage: 'Selected destination does not exist.' });
    patch.destinationId = body.destinationId;
    patch.destinationName = dest.name;
  }

  const pkg = await updatePackage(id, patch);
  if (!pkg) throw createError({ statusCode: 404, statusMessage: 'Package not found.' });
  return { package: pkg };
});
