import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { HashComparer } from '@modules/auth/application/cryptography/hash-comparer';
import { BcryptHasher } from '@modules/auth/infra/cryptography/bcrypt-hasher';
import { schema } from './schema';
import { seed } from './seed';

describe('database seed', () => {
  const connectionString =
    process.env.DATABASE_URL ??
    'postgresql://postgres:postgres@localhost:5432/tests';
  const databaseSchema = `seed_test_${process.pid}_${randomUUID().replaceAll('-', '')}`;
  const adminEmail = 'admin@admin.com';
  const setupPool = new Pool({ connectionString, max: 1 });
  const pool = new Pool({
    connectionString,
    max: 1,
    options: `-c search_path=${databaseSchema}`,
  });
  const db = drizzle(pool, { schema, casing: 'snake_case' });
  const hashComparer: HashComparer = new BcryptHasher();

  beforeAll(async () => {
    await setupPool.query(`CREATE SCHEMA "${databaseSchema}"`);
    const usersMigration = await readFile(
      join(__dirname, '../../../../drizzle/0001_add_users.sql'),
      'utf8',
    );
    await setupPool.query(
      usersMigration.replace(
        'CREATE TABLE "users"',
        `CREATE TABLE "${databaseSchema}"."users"`,
      ),
    );

    const existingPassword = await new BcryptHasher().hash('different-password');
    await db.insert(schema.users).values({
      email: adminEmail,
      password: existingPassword,
    });
  });

  afterAll(async () => {
    await pool.end();
    await setupPool.query(`DROP SCHEMA "${databaseSchema}" CASCADE`);
    await setupPool.end();
  });

  it('should be able to update the existing admin account idempotently', async () => {
    const [existingAdmin] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, adminEmail));

    await seed({
      connectionString,
      schema: databaseSchema,
      max: 1,
    });
    await seed({
      connectionString,
      schema: databaseSchema,
      max: 1,
    });

    const admins = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, adminEmail));

    expect(admins).toHaveLength(1);
    expect(admins[0]?.id).toBe(existingAdmin?.id);
    expect(admins[0]?.password).not.toBe('12345678');
    await expect(
      hashComparer.compare('12345678', admins[0]!.password),
    ).resolves.toBe(true);
  });
});
