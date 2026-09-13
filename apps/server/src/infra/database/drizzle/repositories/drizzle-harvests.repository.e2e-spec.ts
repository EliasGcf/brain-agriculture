import { Test, TestingModule } from '@nestjs/testing';

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

describe('DrizzleHarvestsRepository', () => {
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

  async function createFarm() {
    const producer = await producersRepository.save(makeProducer());
    return farmsRepository.save(makeFarm({ producerId: producer.id.toString() }));
  }

  it('should be able to persist and retrieve a harvest', async () => {
    const farm = await createFarm();
    const harvest = await harvestsRepository.save(
      makeHarvest({ farmId: farm.id.toString() }),
    );

    const persisted = await harvestsRepository.findById(harvest.id.toString());

    expect(persisted).toEqual(harvest);
  });

  it('should be able to find harvests by farm id', async () => {
    const farm = await createFarm();
    const harvest = await harvestsRepository.save(
      makeHarvest({ farmId: farm.id.toString() }),
    );
    const unrelatedFarm = await createFarm();
    const unrelatedHarvest = await harvestsRepository.save(
      makeHarvest({ farmId: unrelatedFarm.id.toString() }),
    );

    await expect(
      harvestsRepository.findManyByFarmId(farm.id.toString()),
    ).resolves.toEqual([harvest]);
    await expect(
      harvestsRepository.findManyByFarmId(unrelatedFarm.id.toString()),
    ).resolves.toEqual([unrelatedHarvest]);
  });

  it('should be able to update a harvest while preserving its identity', async () => {
    const farm = await createFarm();
    const harvest = await harvestsRepository.save(
      makeHarvest({ farmId: farm.id.toString() }),
    );
    const id = harvest.id.toString();
    const createdAt = harvest.createdAt;

    harvest.update({ name: 'Updated harvest' });
    await harvestsRepository.save(harvest);

    const updated = await harvestsRepository.findById(id);

    expect(updated).toEqual(harvest);
    expect(updated?.id.toString()).toBe(id);
    expect(updated?.createdAt).toEqual(createdAt);
  });

  it('should be able to delete a harvest and its planted crops', async () => {
    const farm = await createFarm();
    const harvest = await harvestsRepository.save(
      makeHarvest({ farmId: farm.id.toString() }),
    );
    const crop = await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );

    await harvestsRepository.deleteById(harvest.id.toString());

    await expect(harvestsRepository.findById(harvest.id.toString())).resolves.toBeNull();
    await expect(plantedCropsRepository.findById(crop.id.toString())).resolves.toBeNull();
  });
});
