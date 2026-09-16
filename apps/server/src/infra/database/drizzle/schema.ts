import {
  check,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const producers = pgTable(
  'producers',
  {
    id: uuid().defaultRandom().primaryKey(),
    document: text().notNull().unique(),
    name: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [index('producers_name_idx').on(table.name)],
);

export const farms = pgTable(
  'farms',
  {
    id: uuid().defaultRandom().primaryKey(),
    producerId: uuid()
      .notNull()
      .references(() => producers.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    name: text().notNull(),
    city: text().notNull(),
    state: text().notNull(),
    totalArea: numeric({ precision: 12, scale: 2 }).notNull(),
    arableArea: numeric({ precision: 12, scale: 2 }).notNull(),
    vegetationArea: numeric({ precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [
    check('farms_total_area_positive', sql`${table.totalArea} > 0`),
    check('farms_arable_area_non_negative', sql`${table.arableArea} >= 0`),
    check('farms_vegetation_area_non_negative', sql`${table.vegetationArea} >= 0`),
    check(
      'farms_allocated_areas_within_total',
      sql`${table.arableArea} + ${table.vegetationArea} <= ${table.totalArea}`,
    ),
    index('farms_producer_id_idx').on(table.producerId),
    index('farms_state_idx').on(table.state),
    index('farms_city_idx').on(table.city),
  ],
);

export const harvests = pgTable(
  'harvests',
  {
    id: uuid().defaultRandom().primaryKey(),
    farmId: uuid()
      .notNull()
      .references(() => farms.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [unique('harvests_farm_id_name_unique').on(table.farmId, table.name)],
);

export const plantedCrops = pgTable(
  'planted_crops',
  {
    id: uuid().defaultRandom().primaryKey(),
    harvestId: uuid()
      .notNull()
      .references(() => harvests.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  },
  (table) => [index('planted_crops_harvest_id_idx').on(table.harvestId)],
);

export const users = pgTable('users', {
  id: uuid().defaultRandom().primaryKey(),
  email: text().notNull().unique(),
  password: text().notNull(),
});

export const schema = {
  producers,
  farms,
  harvests,
  plantedCrops,
  users,
};
