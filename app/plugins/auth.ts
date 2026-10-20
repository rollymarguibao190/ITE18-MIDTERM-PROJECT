import { useAuthStore } from '~/stores/auth';

export default defineNuxtPlugin(async (nuxt) => {
  const auth = useAuthStore();
  if (import.meta.server) {
    await auth.init();
  } else {
    if (!auth.initialized) await auth.init();
  }
});
