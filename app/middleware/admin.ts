export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  await auth.init();
  if (!auth.isAuthenticated) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`);
  }
  if (auth.role !== 'admin') {
    return navigateTo('/');
  }
});
