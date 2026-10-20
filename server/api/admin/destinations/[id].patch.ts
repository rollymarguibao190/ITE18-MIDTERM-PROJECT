import { updateDestination } from '../../../utils/destinations';
import { requireRole } from '../../../utils/session';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin');
  const id = getRouterParam(event, 'id') || '';
  const body = await readBody<{
    name?: string;
    province?: string;
    description?: string;
    image?: string;
    highlights?: string[];
  }>(event);

  const patch: Record<string, unknown> = {};
  if (body?.name !== undefined) patch.name = body.name.trim();
  if (body?.province !== undefined) patch.province = body.province.trim();
  if (body?.description !== undefined) patch.description = body.description.trim();
  if (body?.image !== undefined) patch.image = body.image.trim();
  if (body?.highlights !== undefined) patch.highlights = Array.isArray(body.highlights) ? body.highlights.map((h: string) => h.trim()).filter(Boolean) : [];

  const dest = await updateDestination(id, patch);
  if (!dest) throw createError({ statusCode: 404, statusMessage: 'Destination not found.' });
  return { destination: dest };
});
