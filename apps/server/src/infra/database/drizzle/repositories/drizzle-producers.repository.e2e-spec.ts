import { Test, TestingModule } from '@nestjs/testing';

import { DrizzleProducersRepository } from '@infra/database/drizzle/repositories/drizzle-producers.repository';
import { DrizzleModule } from '@infra/database/drizzle/drizzle.module';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { makeProducer } from '@test/factories/make-producer.factory';
import { schema } from '@infra/database/drizzle/schema';
import { eq } from 'drizzle-orm';
import { DrizzleProducerMapper } from '@infra/database/drizzle/mappers/drizzle-producer.mapper';
import { randomUUID } from 'node:crypto';

describe('DrizzleProducersRepository', () => {
  let moduleRef: TestingModule;
  let producersRepository: DrizzleProducersRepository;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [DrizzleModule] }).compile();
    producersRepository = moduleRef.get(ProducersRepository);
  });

  afterAll(() => moduleRef.close());

  it('save', async () => {
    const producer = await producersRepository.save(makeProducer());

    const [saved] = await producersRepository.db
      .select()
      .from(schema.producers)
      .where(eq(schema.producers.id, producer.id.toString()))
      .limit(1);

    expect(saved).toBeDefined();
    expect(producer).toEqual(DrizzleProducerMapper.toDomain(saved));

    const toUpdateData = makeProducer();
    producer.update({ name: toUpdateData.name, document: toUpdateData.document });
    await producersRepository.save(producer);

    const [updated] = await producersRepository.db
      .select()
      .from(schema.producers)
      .where(eq(schema.producers.id, producer.id.toString()))
      .limit(1);

    expect(updated).toBeDefined();
    expect(producer).toEqual(DrizzleProducerMapper.toDomain(updated));
  });

  it('findById', async () => {
    const producer = await producersRepository.save(makeProducer());
    const savedProducer = await producersRepository.findById(producer.id.toString());
    expect(savedProducer).toEqual(producer);
  });

  it('findByDocument', async () => {
    const producer = await producersRepository.save(makeProducer());
    const document = producer.document.value;
    const savedProducer = await producersRepository.findByDocument(document);
    expect(savedProducer).toEqual(producer);
  });

  it('findMany', async () => {
    const marker = `FindMany ${randomUUID()}`;
    const newestProducer = await producersRepository.save(
      makeProducer({
        name: `${marker} Newest Producer`,
        createdAt: new Date('2024-01-03T00:00:00.000Z'),
      }),
    );
    const matchingProducer = await producersRepository.save(
      makeProducer({
        name: `${marker} Matching Producer`,
        createdAt: new Date('2024-01-02T00:00:00.000Z'),
      }),
    );
    const olderProducer = await producersRepository.save(
      makeProducer({
        name: `${marker} Older Producer`,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
      }),
    );

    const firstPage = await producersRepository.findMany({
      search: marker,
      page: 1,
      perPage: 2,
    });

    expect(firstPage).toEqual({
      items: [
        { producer: newestProducer, farmsCount: 0 },
        { producer: matchingProducer, farmsCount: 0 },
      ],
      total: 3,
    });

    const filteredPage = await producersRepository.findMany({
      search: 'matching',
      page: 1,
      perPage: 10,
    });

    expect(filteredPage).toEqual({
      items: [{ producer: matchingProducer, farmsCount: 0 }],
      total: 1,
    });

    const documentPage = await producersRepository.findMany({
      search: matchingProducer.document.formatted,
      page: 1,
      perPage: 10,
    });

    expect(documentPage).toEqual({
      items: [{ producer: matchingProducer, farmsCount: 0 }],
      total: 1,
    });

    const emptyPage = await producersRepository.findMany({
      search: 'does not exist',
      page: 1,
      perPage: 10,
    });

    expect(emptyPage).toEqual({ items: [], total: 0 });
    expect(firstPage.items.map((item) => item.producer)).not.toContain(olderProducer);
  });
});
