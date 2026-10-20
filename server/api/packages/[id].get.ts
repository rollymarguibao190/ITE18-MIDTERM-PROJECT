export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id') || '';
  const pkg = getPackageById(id);
  if (!pkg) {
    throw createError({ statusCode: 404, statusMessage: 'Package not found' });
  }
  return { package: pkg };
});
