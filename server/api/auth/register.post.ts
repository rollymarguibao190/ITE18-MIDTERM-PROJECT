import { createUser, toPublicUser, type StoredUser } from '../../utils/auth';
import { createSession } from '../../utils/session';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ name?: string; email?: string; password?: string }>(event);
  const name = (body?.name || '').trim();
  const email = (body?.email || '').trim();
  const password = body?.password || '';

  if (!name || name.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter your full name (at least 2 characters).' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Please enter a valid email address.' });
  }
  if (!password || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 6 characters.' });
  }

  let user: StoredUser;
  try {
    user = await createUser(name, email, password, 'customer');
  } catch (e: any) {
    if (e?.message === 'EMAIL_TAKEN') {
      throw createError({ statusCode: 409, statusMessage: 'An account with this email already exists.' });
    }
    throw e;
  }

  await createSession(event, user);
  return { user: toPublicUser(user) };
});
