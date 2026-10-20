import { createPackage } from '../../../utils/packages';
import { getDestinationById } from '../../../utils/destinations';
import { requireRole } from '../../../utils/session';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'operator', 'admin');
  const body = await readBody<{
    name?: string;
    destinationId?: string;
    durationDays?: number;
    price?: number;
    image?: string;
    description?: string;
    includes?: string[];
  }>(event);

  const name = (body?.name || '').trim();
  const destinationId = (body?.destinationId || '').trim();
  const durationDays = Number(body?.durationDays) || 0;
  const price = Number(body?.price) || 0;
  const description = (body?.description || '').trim();
  const image = (body?.image || '').trim() || 'https://images.pexels.com/photos/3601425/pexels-photo-3601425.jpeg?auto=compress&cs=tinysrgb&w=1200';
  const includes = Array.isArray(body?.includes) ? body.includes.map((i) => i.trim()).filter(Boolean) : [];

  if (!name) throw createError({ statusCode: 400, statusMessage: 'Package name is required.' });
  if (!destinationId) throw createError({ statusCode: 400, statusMessage: 'Destination is required.' });
  if (durationDays < 1) throw createError({ statusCode: 400, statusMessage: 'Duration must be at least 1 day.' });
  if (price < 1) throw createError({ statusCode: 400, statusMessage: 'Price must be a positive number.' });
  if (!description) throw createError({ statusCode: 400, statusMessage: 'Description is required.' });

  const dest = getDestinationById(destinationId);
  if (!dest) throw createError({ statusCode: 400, statusMessage: 'Selected destination does not exist.' });

  const pkg = await createPackage({
    name,
    destinationId,
    destinationName: dest.name,
    durationDays,
    price,
    image,
    description,
    includes,
  });
  return { package: pkg };
});
