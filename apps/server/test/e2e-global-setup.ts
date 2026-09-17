import { loadEnv } from "vite";
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

import { schema } from '../src/infra/database/drizzle/schema';

export default async function e2eGlobalSetup() {
  const env = loadEnv('test', process.cwd(), '')
  const url = env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not defined in the environment variables');

  const pool = new Pool({ connectionString: url, max: 1 });
  const db = drizzle({ client: pool });
  await migrate(db, { migrationsFolder: './drizzle' });
  const tables = Object.values(schema).map((table) => sql`${table}`);
  await db.execute(
    sql`truncate table ${sql.join(tables, sql`, `)} restart identity cascade`,
  );
  await pool.end();
}
