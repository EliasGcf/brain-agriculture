import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

import { schema } from '../src/infra/database/drizzle/schema';

export default async function e2eGlobalSetup() {
  const url = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString: url, max: 1 });
  const db = drizzle({ client: pool });
  await migrate(db, { migrationsFolder: './drizzle' });
  const tables = Object.values(schema).map((table) => sql`${table}`);
  await db.execute(
    sql`truncate table ${sql.join(tables, sql`, `)} restart identity cascade`,
  );
  await pool.end();
}
