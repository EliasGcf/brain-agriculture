import { Inject, Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike } from 'drizzle-orm';

import { PaginatedResult } from '@core/dto/paginated-result';

import { Producer } from '@modules/producers/domain/entities/producer';
import {
  FindManyProducersParams,
  ProducersRepository,
} from '@modules/producers/domain/repositories/producers.repository';

import { schema } from '@infra/database/drizzle/schema';

import { DrizzleProducerMapper } from '@infra/database/drizzle/mappers/drizzle-producer.mapper';
import { type DB, DRIZZLE } from '@infra/database/drizzle/drizzle.constants';

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

  async findMany(params: FindManyProducersParams): Promise<PaginatedResult<Producer>> {
    const conditions = [];

    if (params.name) {
      conditions.push(ilike(schema.producers.name, `%${params.name}%`));
    }

    if (params.document) {
      conditions.push(ilike(schema.producers.document, `%${params.document}%`));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (params.page - 1) * params.perPage;

    const [rows, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(schema.producers)
        .where(where)
        .orderBy(desc(schema.producers.createdAt), asc(schema.producers.id))
        .limit(params.perPage)
        .offset(offset),
      this.db.select({ total: count() }).from(schema.producers).where(where),
    ]);

    return {
      items: rows.map(DrizzleProducerMapper.toDomain),
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
