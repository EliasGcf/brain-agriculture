import { Test, TestingModule } from '@nestjs/testing';
import { eq } from 'drizzle-orm';

import { schema } from '@infra/database/drizzle/schema';
import { DrizzleModule } from '@infra/database/drizzle/drizzle.module';
import { DrizzleFarmsRepository } from '@infra/database/drizzle/repositories/drizzle-farms.repository';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { makeFarm } from '@test/factories/make-farm.factory';
import { makeProducer } from '@test/factories/make-producer.factory';

describe('DrizzleFarmsRepository', () => {
  let moduleRef: TestingModule;
  let farmsRepository: DrizzleFarmsRepository;
  let producersRepository: ProducersRepository;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [DrizzleModule] }).compile();
    farmsRepository = moduleRef.get(FarmsRepository);
    producersRepository = moduleRef.get(ProducersRepository);
  });

  afterAll(() => moduleRef.close());

  it('should be able to persist and retrieve a farm with its value objects', async () => {
    const producer = await producersRepository.save(makeProducer());
    const farm = await farmsRepository.save(
      makeFarm({ producerId: producer.id.toString() }),
    );

    const persisted = await farmsRepository.findById(farm.id.toString());

    expect(persisted).toEqual(farm);
    expect(persisted?.totalArea.value).toBe(farm.totalArea.value);
    expect(persisted?.arableArea.value).toBe(farm.arableArea.value);
    expect(persisted?.vegetationArea.value).toBe(farm.vegetationArea.value);
  });

  it('should be able to update a farm while preserving its identity', async () => {
    const producer = await producersRepository.save(makeProducer());
    const farm = await farmsRepository.save(
      makeFarm({ producerId: producer.id.toString() }),
    );
    const id = farm.id.toString();
    const createdAt = farm.createdAt;

    farm.update({ name: 'Updated farm' });
    await farmsRepository.save(farm);

    const updated = await farmsRepository.findById(id);

    expect(updated).toEqual(farm);
    expect(updated?.id.toString()).toBe(id);
    expect(updated?.createdAt).toEqual(createdAt);
  });

  it('should be able to delete a persisted farm', async () => {
    const producer = await producersRepository.save(makeProducer());
    const farm = await farmsRepository.save(
      makeFarm({ producerId: producer.id.toString() }),
    );

    await farmsRepository.deleteById(farm.id.toString());

    await expect(farmsRepository.findById(farm.id.toString())).resolves.toBeNull();

    const [deleted] = await farmsRepository.db
      .select()
      .from(schema.farms)
      .where(eq(schema.farms.id, farm.id.toString()))
      .limit(1);

    expect(deleted).toBeUndefined();
  });
});
