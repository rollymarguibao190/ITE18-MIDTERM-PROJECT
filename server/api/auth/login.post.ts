import { findUserByEmail, verifyPassword, toPublicUser } from '../../utils/auth';
import { createSession } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email?: string; password?: string }>(event);
  const email = (body?.email || '').trim();
  const password = body?.password || '';

  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password are required.' });
  }

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(user, password))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password.' });
  }

  await createSession(event, user);
  return { user: toPublicUser(user) };
});
