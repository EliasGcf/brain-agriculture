import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, countDistinct, desc, eq, ilike, sql, sum } from 'drizzle-orm';

import { schema } from '@infra/database/drizzle/schema';
import { type DB, DRIZZLE } from '@infra/database/drizzle/drizzle.constants';
import { DrizzleFarmMapper } from '@infra/database/drizzle/mappers/drizzle-farm.mapper';
import { Farm } from '@modules/farms/domain/entities/farm';
import {
  FarmsRepository,
  FindManyFarmsParams,
} from '@modules/farms/domain/repositories/farms.repository';
import { PaginatedResult } from '@core/dto/paginated-result';
import { ListFarmsDto } from '@modules/farms/application/dto/list-farms.dto';
import { DrizzleProducerMapper } from '@infra/database/drizzle/mappers/drizzle-producer.mapper';
import { FarmsDashboardMetricsDto } from '@modules/metrics/application/dto/dashboard-metrics.dto';

@Injectable()
export class DrizzleFarmsRepository implements FarmsRepository {
  constructor(@Inject(DRIZZLE) public readonly db: DB) {}

  async getDashboardMetrics(): Promise<FarmsDashboardMetricsDto> {
    const normalizedCrop = sql`lower(trim(${schema.plantedCrops.name}))`;

    const [[summary], byState, byCrop] = await Promise.all([
      this.db
        .select({
          farmCount: sql<number>`count(*)::int`,
          totalHectares: sql<number>`coalesce(sum(${schema.farms.totalArea}), 0)::float`,
          arableArea: sql<number>`coalesce(sum(${schema.farms.arableArea}), 0)::float`,
          vegetationArea: sql<number>`coalesce(sum(${schema.farms.vegetationArea}), 0)::float`,
          otherUses: sql<number>`coalesce(sum(${schema.farms.totalArea}) - sum(${schema.farms.arableArea}) - sum(${schema.farms.vegetationArea}), 0)::float`,
        })
        .from(schema.farms),
      this.db
        .select({ state: schema.farms.state, hectares: sum(schema.farms.totalArea) })
        .from(schema.farms)
        .groupBy(schema.farms.state)
        .orderBy(desc(sum(schema.farms.totalArea)), asc(schema.farms.state)),
      this.db
        .select({
          crop: sql<string>`min(trim(${schema.plantedCrops.name}))`,
          farms: countDistinct(schema.farms.id),
        })
        .from(schema.plantedCrops)
        .innerJoin(schema.harvests, eq(schema.harvests.id, schema.plantedCrops.harvestId))
        .innerJoin(schema.farms, eq(schema.farms.id, schema.harvests.farmId))
        .groupBy(normalizedCrop)
        .orderBy(desc(countDistinct(schema.farms.id)), asc(normalizedCrop)),
    ]);

    return {
      farmCount: Number(summary.farmCount),
      totalHectares: Number(summary.totalHectares),
      hectaresByState: byState.map(({ state, hectares }) => ({ state, hectares: Number(hectares) })),
      farmsByCrop: byCrop.map(({ crop, farms }) => ({ crop, farms: Number(farms) })),
      landUse: {
        arableArea: Number(summary.arableArea),
        vegetationArea: Number(summary.vegetationArea),
        otherUses: Number(summary.otherUses),
      },
    };
  }

  async findById(id: string): Promise<Farm | null> {
    const [farm] = await this.db
      .select()
      .from(schema.farms)
      .where(eq(schema.farms.id, id))
      .limit(1);

    if (!farm) return null;

    return DrizzleFarmMapper.toDomain(farm);
  }

  async findManyByProducerId(producerId: string): Promise<Farm[]> {
    const farms = await this.db
      .select()
      .from(schema.farms)
      .where(eq(schema.farms.producerId, producerId));

    return farms.map(DrizzleFarmMapper.toDomain);
  }

  async findMany(params: FindManyFarmsParams): Promise<PaginatedResult<ListFarmsDto>> {
    const conditions = [];

    if (params.name) conditions.push(ilike(schema.farms.name, `%${params.name}%`));
    if (params.producerId)
      conditions.push(eq(schema.farms.producerId, params.producerId));
    if (params.city) conditions.push(ilike(schema.farms.city, `%${params.city}%`));
    if (params.state) conditions.push(ilike(schema.farms.state, `%${params.state}%`));

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.perPage;

    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select({
          farm: schema.farms,
          producer: schema.producers,
        })
        .from(schema.farms)
        .innerJoin(schema.producers, eq(schema.farms.producerId, schema.producers.id))
        .where(where)
        .orderBy(desc(schema.farms.createdAt), asc(schema.farms.id))
        .limit(params.perPage)
        .offset(offset),
      this.db.select({ total: count() }).from(schema.farms).where(where),
    ]);

    return {
      total,
      items: rows.map(({ farm, producer }) => ({
        farm: DrizzleFarmMapper.toDomain(farm),
        owner: DrizzleProducerMapper.toDomain(producer),
      })),
    };
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
