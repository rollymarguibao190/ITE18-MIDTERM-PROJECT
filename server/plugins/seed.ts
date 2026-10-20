import { ensureSeedUsers } from '../utils/seed';

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('request', async () => {
    await ensureSeedUsers();
  });
});
