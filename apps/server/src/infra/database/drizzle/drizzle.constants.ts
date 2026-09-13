import { NodePgDatabase } from 'drizzle-orm/node-postgres';

import { schema } from '@infra/database/drizzle/schema';

export const DRIZZLE_POOL = 'DRIZZLE_POOL';
export const DRIZZLE = 'DRIZZLE';

export type DB = NodePgDatabase<typeof schema>;
