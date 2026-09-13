import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';
import { makeFarm } from '@test/factories/make-farm.factory';
import { makeHarvest } from '@test/factories/make-harvest.factory';
import { InMemoryFarmRepository } from '@test/repositories/in-memory-farm-repository';
import { InMemoryHarvestRepository } from '@test/repositories/in-memory-harvest-repository';
import { InMemoryPlantedCropRepository } from '@test/repositories/in-memory-planted-crop-repository';
import { DeleteFarmUseCase } from './delete-farm.use-case';

describe('DeleteFarmUseCase', () => {
  let plantedCropRepository: InMemoryPlantedCropRepository;
  let farmRepository: InMemoryFarmRepository;
  let harvestRepository: InMemoryHarvestRepository;
  let useCase: DeleteFarmUseCase;

  beforeEach(() => {
    plantedCropRepository = new InMemoryPlantedCropRepository();
    harvestRepository = new InMemoryHarvestRepository(plantedCropRepository);
    farmRepository = new InMemoryFarmRepository(harvestRepository);
    useCase = new DeleteFarmUseCase(farmRepository);
  });

  it('should be able to delete a farm and all descendants while preserving unrelated records', async () => {
    const farm = await farmRepository.save(makeFarm({ producerId: 'producer-1' }));
    const harvest = makeHarvest({ farmId: farm.id.toString() });
    await harvestRepository.save(harvest);
    const crop = await plantedCropRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );
    const unrelatedFarm = await farmRepository.save(makeFarm());
    const unrelatedHarvest = await harvestRepository.save(
      makeHarvest({ farmId: unrelatedFarm.id.toString() }),
    );
    const unrelatedCrop = await plantedCropRepository.save(
      makePlantedCrop({ harvestId: unrelatedHarvest.id.toString() }),
    );

    await useCase.execute({ id: farm.id.toString() });

    await expect(farmRepository.findById(farm.id.toString())).resolves.toBeNull();
    await expect(harvestRepository.findById(harvest.id.toString())).resolves.toBeNull();
    await expect(plantedCropRepository.findById(crop.id.toString())).resolves.toBeNull();
    await expect(farmRepository.findById(unrelatedFarm.id.toString())).resolves.toBe(
      unrelatedFarm,
    );
    await expect(
      harvestRepository.findById(unrelatedHarvest.id.toString()),
    ).resolves.toBe(unrelatedHarvest);
    await expect(
      plantedCropRepository.findById(unrelatedCrop.id.toString()),
    ).resolves.toBe(unrelatedCrop);
  });

  it('should not be able to delete a missing farm', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
