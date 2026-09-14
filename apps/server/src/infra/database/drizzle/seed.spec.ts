import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { BcryptHasher } from '@modules/auth/infra/cryptography/bcrypt-hasher';
import { schema } from './schema';
import { seed } from './seed';

describe('database seed', () => {
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/tests',
  });
  const db = drizzle(pool, { schema, casing: 'snake_case' });

  afterAll(async () => {
    await pool.end();
  });

  it('should be able to create the default admin account with a bcrypt password hash', async () => {
    await db.delete(schema.users).where(eq(schema.users.email, 'admin@admin.com'));

    await seed();

    const [admin] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, 'admin@admin.com'));

    expect(admin).toBeDefined();
    expect(admin?.email).toBe('admin@admin.com');
    expect(admin?.password).not.toBe('12345678');
    await expect(new BcryptHasher().compare('12345678', admin!.password)).resolves.toBe(
      true,
    );
  });

  it('should be able to run repeatedly without creating duplicate admin accounts', async () => {
    await seed();
    await seed();

    const admins = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, 'admin@admin.com'));

    expect(admins).toHaveLength(1);
  });
});
