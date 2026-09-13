import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, type DB } from '@infra/database/drizzle/drizzle.constants';
import { DrizzlePlantedCropMapper } from '@infra/database/drizzle/mappers/drizzle-planted-crop.mapper';
import { schema } from '@infra/database/drizzle/schema';
import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';
import { PlantedCropsRepository } from '@modules/farms/domain/repositories/planted-crops.repository';

@Injectable()
export class DrizzlePlantedCropsRepository implements PlantedCropsRepository {
  constructor(@Inject(DRIZZLE) public readonly db: DB) {}

  async findById(id: string): Promise<PlantedCrop | null> {
    const [crop] = await this.db
      .select()
      .from(schema.plantedCrops)
      .where(eq(schema.plantedCrops.id, id))
      .limit(1);

    if (!crop) return null;

    return DrizzlePlantedCropMapper.toDomain(crop);
  }

  async findManyByHarvestId(harvestId: string): Promise<PlantedCrop[]> {
    const crops = await this.db
      .select()
      .from(schema.plantedCrops)
      .where(eq(schema.plantedCrops.harvestId, harvestId));

    return crops.map(DrizzlePlantedCropMapper.toDomain);
  }

  async save(crop: PlantedCrop): Promise<PlantedCrop> {
    const raw = DrizzlePlantedCropMapper.toRaw(crop);

    await this.db.insert(schema.plantedCrops).values(raw).onConflictDoUpdate({
      target: schema.plantedCrops.id,
      set: raw,
    });

    return crop;
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(schema.plantedCrops).where(eq(schema.plantedCrops.id, id));
  }
}
