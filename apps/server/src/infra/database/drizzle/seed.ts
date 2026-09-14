import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { BcryptHasher } from '@infra/cryptography/bcrypt-hasher';
import { schema } from "@infra/database/drizzle/schema";

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = '12345678';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');

async function seed(): Promise<void> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const db = drizzle(pool, { schema, casing: 'snake_case' });
    const password = await new BcryptHasher().hash(ADMIN_PASSWORD);

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

seed()
  .then(() => {
    console.log('Database seeded successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  });

