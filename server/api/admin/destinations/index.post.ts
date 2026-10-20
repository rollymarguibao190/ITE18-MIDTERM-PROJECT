import { createDestination } from '../../../utils/destinations';
import { requireRole } from '../../../utils/session';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin');
  const body = await readBody<{
    name?: string;
    province?: string;
    description?: string;
    image?: string;
    highlights?: string[];
  }>(event);

  const name = (body?.name || '').trim();
  const province = (body?.province || '').trim();
  const description = (body?.description || '').trim();
  const image = (body?.image || '').trim() || 'https://images.pexels.com/photos/215200/pexels-photo-215200.jpeg?auto=compress&cs=tinysrgb&w=1200';
  const highlights = Array.isArray(body?.highlights) ? body.highlights.map((h) => h.trim()).filter(Boolean) : [];

  if (!name) throw createError({ statusCode: 400, statusMessage: 'Name is required.' });
  if (!province) throw createError({ statusCode: 400, statusMessage: 'Province is required.' });
  if (!description) throw createError({ statusCode: 400, statusMessage: 'Description is required.' });

  const dest = await createDestination({ name, province, description, image, highlights });
  return { destination: dest };
});
