import { getUsers, toPublicUserWithDate } from '../../utils/auth';
import { requireRole } from '../../utils/session';

export default defineEventHandler(async (event) => {
  await requireRole(event, 'admin');
  const users = await getUsers();
  return { users: users.map(toPublicUserWithDate) };
});
