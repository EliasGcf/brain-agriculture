import { Inject, Injectable } from '@nestjs/common';
import { asc, count, desc, eq, ilike, or } from 'drizzle-orm';

import { Producer } from '@modules/producers/domain/entities/producer';
import {
  FindManyProducersParams,
  FindManyProducersResult,
  ProducersRepository,
} from '@modules/producers/domain/repositories/producers.repository';

import { schema } from '@infra/database/drizzle/schema';

import { DrizzleProducerMapper } from '@infra/database/drizzle/mappers/drizzle-producer.mapper';
import { type DB, DRIZZLE } from '@infra/database/drizzle/drizzle.constants';
import { Document } from '@modules/producers/domain/value-objects/document';

@Injectable()
export class DrizzleProducersRepository implements ProducersRepository {
  constructor(@Inject(DRIZZLE) public readonly db: DB) {}

  async findById(id: string): Promise<Producer | null> {
    const [producer] = await this.db
      .select()
      .from(schema.producers)
      .where(eq(schema.producers.id, id))
      .limit(1);

    if (!producer) return null;

    return DrizzleProducerMapper.toDomain(producer);
  }

  async findByDocument(document: string): Promise<Producer | null> {
    const [producer] = await this.db
      .select()
      .from(schema.producers)
      .where(eq(schema.producers.document, document))
      .limit(1);

    if (!producer) return null;

    return DrizzleProducerMapper.toDomain(producer);
  }

  async findMany(params: FindManyProducersParams): Promise<FindManyProducersResult> {
    const conditions = [ilike(schema.producers.name, `%${params.search}%`)];

    const normalizedSearch = params.search ? Document.strip(params.search) : '';
    if (normalizedSearch) {
      conditions.push(ilike(schema.producers.document, `%${normalizedSearch}%`));
    }

    const where = conditions.length > 0 ? or(...conditions) : undefined;
    const offset = (params.page - 1) * params.perPage;

    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select({ producer: schema.producers, farmsCount: count(schema.farms.id) })
        .from(schema.producers)
        .leftJoin(schema.farms, eq(schema.farms.producerId, schema.producers.id))
        .where(where)
        .groupBy(schema.producers.id)
        .orderBy(desc(schema.producers.createdAt), asc(schema.producers.id))
        .limit(params.perPage)
        .offset(offset),
      this.db.select({ total: count() }).from(schema.producers).where(where),
    ]);

    return {
      items: rows.map(({ farmsCount, producer }) => ({
        producer: DrizzleProducerMapper.toDomain(producer),
        farmsCount,
      })),
      total,
    };
  }

  async save(producer: Producer): Promise<Producer> {
    const raw = DrizzleProducerMapper.toRaw(producer);

    await this.db.insert(schema.producers).values(raw).onConflictDoUpdate({
      target: schema.producers.id,
      set: raw,
    });

    return producer;
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(schema.producers).where(eq(schema.producers.id, id));
  }
}
