import { UniqueEntityID } from '@core/entities/unique-entity-id';

import { Farm } from '@modules/farms/domain/entities/farm';
import { Area } from '@modules/farms/domain/value-objects/area';

import { schema } from '@infra/database/drizzle/schema';

type RawFarm = typeof schema.farms.$inferSelect;
type RawInsertFarm = typeof schema.farms.$inferInsert;

export class DrizzleFarmMapper {
  static toDomain(raw: RawFarm): Farm {
    return Farm.create(
      {
        name: raw.name,
        producerId: raw.producerId,
        city: raw.city,
        state: raw.state,
        totalArea: Area.create(Number(raw.totalArea)),
        arableArea: Area.create(Number(raw.arableArea)),
        vegetationArea: Area.create(Number(raw.vegetationArea)),
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toRaw(farm: Farm): RawInsertFarm {
    return {
      id: farm.id.toValue(),
      producerId: farm.producerId,
      name: farm.name,
      city: farm.city,
      state: farm.state,
      totalArea: farm.totalArea.value.toString(),
      arableArea: farm.arableArea.value.toString(),
      vegetationArea: farm.vegetationArea.value.toString(),
      createdAt: farm.createdAt,
    };
  }
}
