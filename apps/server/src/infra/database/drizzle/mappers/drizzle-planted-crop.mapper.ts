import { UniqueEntityID } from '@core/entities/unique-entity-id';

import { schema } from '@infra/database/drizzle/schema';
import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';

type RawPlantedCrop = typeof schema.plantedCrops.$inferSelect;
type RawInsertPlantedCrop = typeof schema.plantedCrops.$inferInsert;

export class DrizzlePlantedCropMapper {
  static toDomain(raw: RawPlantedCrop): PlantedCrop {
    return PlantedCrop.create(
      {
        name: raw.name,
        harvestId: raw.harvestId,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toRaw(crop: PlantedCrop): RawInsertPlantedCrop {
    return {
      id: crop.id.toValue(),
      harvestId: crop.harvestId,
      name: crop.name,
      createdAt: crop.createdAt,
    };
  }
}
