import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { schema } from './schema';
import { BcryptHasher } from '@modules/auth/infra/cryptography/bcrypt-hasher';

const ADMIN_EMAIL = 'admin@admin.com';

export interface SeedOptions {
  connectionString?: string;
  max?: number;
  schema?: string;
}

export async function seed(options: SeedOptions = {}): Promise<void> {
  const searchPath = options.schema?.replaceAll('"', '""');
  const pool = new Pool({
    connectionString: options.connectionString ?? process.env.DATABASE_URL,
    max: options.max,
    options: searchPath ? `-c search_path="${searchPath}"` : undefined,
  });

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
