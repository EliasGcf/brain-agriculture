import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, type DB } from '@infra/database/drizzle/drizzle.constants';
import { DrizzleHarvestMapper } from '@infra/database/drizzle/mappers/drizzle-harvest.mapper';
import { schema } from '@infra/database/drizzle/schema';
import { Harvest } from '@modules/farms/domain/entities/harvest';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';

@Injectable()
export class DrizzleHarvestsRepository implements HarvestsRepository {
  constructor(@Inject(DRIZZLE) public readonly db: DB) {}

  async findById(id: string): Promise<Harvest | null> {
    const [harvest] = await this.db
      .select()
      .from(schema.harvests)
      .where(eq(schema.harvests.id, id))
      .limit(1);

    if (!harvest) return null;

    return DrizzleHarvestMapper.toDomain(harvest);
  }

  async findManyByFarmId(farmId: string): Promise<Harvest[]> {
    const harvests = await this.db
      .select()
      .from(schema.harvests)
      .where(eq(schema.harvests.farmId, farmId));

    return harvests.map(DrizzleHarvestMapper.toDomain);
  }

  async save(harvest: Harvest): Promise<Harvest> {
    const raw = DrizzleHarvestMapper.toRaw(harvest);

    await this.db.insert(schema.harvests).values(raw).onConflictDoUpdate({
      target: schema.harvests.id,
      set: raw,
    });

    return harvest;
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(schema.harvests).where(eq(schema.harvests.id, id));
  }
}
