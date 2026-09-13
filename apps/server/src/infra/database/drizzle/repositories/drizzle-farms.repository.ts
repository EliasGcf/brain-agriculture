import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { schema } from '@infra/database/drizzle/schema';
import { type DB, DRIZZLE } from '@infra/database/drizzle/drizzle.constants';
import { DrizzleFarmMapper } from '@infra/database/drizzle/mappers/drizzle-farm.mapper';
import { Farm } from '@modules/farms/domain/entities/farm';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';

@Injectable()
export class DrizzleFarmsRepository implements FarmsRepository {
  constructor(@Inject(DRIZZLE) public readonly db: DB) {}

  async findById(id: string): Promise<Farm | null> {
    const [farm] = await this.db
      .select()
      .from(schema.farms)
      .where(eq(schema.farms.id, id))
      .limit(1);

    if (!farm) return null;

    return DrizzleFarmMapper.toDomain(farm);
  }

  async save(farm: Farm): Promise<Farm> {
    const raw = DrizzleFarmMapper.toRaw(farm);

    await this.db.insert(schema.farms).values(raw).onConflictDoUpdate({
      target: schema.farms.id,
      set: raw,
    });

    return farm;
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(schema.farms).where(eq(schema.farms.id, id));
  }
}
