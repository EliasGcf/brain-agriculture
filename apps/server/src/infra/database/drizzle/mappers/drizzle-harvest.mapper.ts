import { UniqueEntityID } from '@core/entities/unique-entity-id';

import { schema } from '@infra/database/drizzle/schema';
import { Harvest } from '@modules/farms/domain/entities/harvest';

type RawHarvest = typeof schema.harvests.$inferSelect;
type RawInsertHarvest = typeof schema.harvests.$inferInsert;

export class DrizzleHarvestMapper {
  static toDomain(raw: RawHarvest): Harvest {
    return Harvest.create(
      {
        name: raw.name,
        farmId: raw.farmId,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toRaw(harvest: Harvest): RawInsertHarvest {
    return {
      id: harvest.id.toValue(),
      farmId: harvest.farmId,
      name: harvest.name,
      createdAt: harvest.createdAt,
    };
  }
}
