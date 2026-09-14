import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { schema } from './schema';
import { BcryptHasher } from '@modules/auth/infra/cryptography/bcrypt-hasher';

const ADMIN_EMAIL = 'admin@admin.com';

export async function seed(): Promise<void> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const db = drizzle(pool, { schema, casing: 'snake_case' });
    const password = await new BcryptHasher().hash('12345678');

    await db
      .insert(schema.users)
      .values({ email: ADMIN_EMAIL, password })
      .onConflictDoUpdate({
        target: schema.users.email,
        set: { email: ADMIN_EMAIL, password },
      });
  } finally {
    await pool.end();
  }
}

if (process.argv[1]?.endsWith('/seed.ts')) {
  seed().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
