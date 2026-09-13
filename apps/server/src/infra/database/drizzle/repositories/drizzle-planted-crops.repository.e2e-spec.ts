import { Test, TestingModule } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';

import { DrizzleModule } from '@infra/database/drizzle/drizzle.module';
import { DrizzleFarmsRepository } from '@infra/database/drizzle/repositories/drizzle-farms.repository';
import { DrizzleHarvestsRepository } from '@infra/database/drizzle/repositories/drizzle-harvests.repository';
import { DrizzlePlantedCropsRepository } from '@infra/database/drizzle/repositories/drizzle-planted-crops.repository';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';
import { PlantedCropsRepository } from '@modules/farms/domain/repositories/planted-crops.repository';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { makeFarm } from '@test/factories/make-farm.factory';
import { makeHarvest } from '@test/factories/make-harvest.factory';
import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';
import { makeProducer } from '@test/factories/make-producer.factory';

describe('DrizzlePlantedCropsRepository', () => {
  let moduleRef: TestingModule;
  let farmsRepository: DrizzleFarmsRepository;
  let harvestsRepository: DrizzleHarvestsRepository;
  let plantedCropsRepository: DrizzlePlantedCropsRepository;
  let producersRepository: ProducersRepository;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [DrizzleModule] }).compile();
    farmsRepository = moduleRef.get(FarmsRepository);
    harvestsRepository = moduleRef.get(HarvestsRepository);
    plantedCropsRepository = moduleRef.get(PlantedCropsRepository);
    producersRepository = moduleRef.get(ProducersRepository);
  });

  afterAll(() => moduleRef.close());

  async function createHarvest() {
    const producer = await producersRepository.save(makeProducer());
    const farm = await farmsRepository.save(
      makeFarm({ producerId: producer.id.toString() }),
    );
    return harvestsRepository.save(makeHarvest({ farmId: farm.id.toString() }));
  }

  it('should be able to persist and retrieve a planted crop', async () => {
    const harvest = await createHarvest();
    const crop = await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );

    const persisted = await plantedCropsRepository.findById(crop.id.toString());

    expect(persisted).toEqual(crop);
  });

  it('should be able to find planted crops by harvest id', async () => {
    const harvest = await createHarvest();
    const crop = await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );

    await expect(
      plantedCropsRepository.findManyByHarvestId(harvest.id.toString()),
    ).resolves.toEqual([crop]);
    await expect(
      plantedCropsRepository.findManyByHarvestId(randomUUID()),
    ).resolves.toEqual([]);
  });

  it('should be able to update a planted crop while preserving its identity', async () => {
    const harvest = await createHarvest();
    const crop = await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );
    const id = crop.id.toString();
    const createdAt = crop.createdAt;

    crop.update({ name: 'Updated planted crop' });
    await plantedCropsRepository.save(crop);

    const updated = await plantedCropsRepository.findById(id);

    expect(updated).toEqual(crop);
    expect(updated?.id.toString()).toBe(id);
    expect(updated?.createdAt).toEqual(createdAt);
  });

  it('should be able to delete a planted crop', async () => {
    const harvest = await createHarvest();
    const crop = await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );

    await plantedCropsRepository.deleteById(crop.id.toString());

    await expect(plantedCropsRepository.findById(crop.id.toString())).resolves.toBeNull();
  });
});
