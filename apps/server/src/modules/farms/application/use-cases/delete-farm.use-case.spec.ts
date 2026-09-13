import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';
import { makeFarm } from '@test/factories/make-farm.factory';
import { makeHarvest } from '@test/factories/make-harvest.factory';
import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { DeleteFarmUseCase } from './delete-farm.use-case';

describe('DeleteFarmUseCase', () => {
  let plantedCropsRepository: InMemoryPlantedCropsRepository;
  let farmsRepository: InMemoryFarmsRepository;
  let harvestsRepository: InMemoryHarvestsRepository;
  let useCase: DeleteFarmUseCase;

  beforeEach(() => {
    plantedCropsRepository = new InMemoryPlantedCropsRepository();
    harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    farmsRepository = new InMemoryFarmsRepository(harvestsRepository);
    useCase = new DeleteFarmUseCase(farmsRepository);
  });

  it('should be able to delete a farm and all descendants while preserving unrelated records', async () => {
    const farm = await farmsRepository.save(makeFarm({ producerId: 'producer-1' }));
    const harvest = makeHarvest({ farmId: farm.id.toString() });
    await harvestsRepository.save(harvest);
    const crop = await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );
    const unrelatedFarm = await farmsRepository.save(makeFarm());
    const unrelatedHarvest = await harvestsRepository.save(
      makeHarvest({ farmId: unrelatedFarm.id.toString() }),
    );
    const unrelatedCrop = await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: unrelatedHarvest.id.toString() }),
    );

    await useCase.execute({ id: farm.id.toString() });

    await expect(farmsRepository.findById(farm.id.toString())).resolves.toBeNull();
    await expect(harvestsRepository.findById(harvest.id.toString())).resolves.toBeNull();
    await expect(plantedCropsRepository.findById(crop.id.toString())).resolves.toBeNull();
    await expect(farmsRepository.findById(unrelatedFarm.id.toString())).resolves.toBe(
      unrelatedFarm,
    );
    await expect(
      harvestsRepository.findById(unrelatedHarvest.id.toString()),
    ).resolves.toBe(unrelatedHarvest);
    await expect(
      plantedCropsRepository.findById(unrelatedCrop.id.toString()),
    ).resolves.toBe(unrelatedCrop);
  });

  it('should not be able to delete a missing farm', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
