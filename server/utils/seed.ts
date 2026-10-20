import { createUser, getUsers } from './auth';

let seeded = false;

export async function ensureSeedUsers() {
  if (seeded) return;
  seeded = true;
  const users = await getUsers();
  if (users.length > 0) return;

  // Seed demo accounts. Passwords are demo-only and visible in source for the student project.
  await createUser('Demo Admin', 'admin@caraga.dev', 'admin123', 'admin');
  await createUser('Island Tours Operator', 'operator@caraga.dev', 'operator123', 'operator');
  await createUser('Demo Customer', 'customer@caraga.dev', 'customer123', 'customer');
}
