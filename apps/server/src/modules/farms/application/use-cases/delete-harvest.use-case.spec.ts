import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makeHarvest } from '@test/factories/make-harvest.factory';
import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';
import { InMemoryHarvestRepository } from '@test/repositories/in-memory-harvest-repository';
import { InMemoryPlantedCropRepository } from '@test/repositories/in-memory-planted-crop-repository';
import { DeleteHarvestUseCase } from './delete-harvest.use-case';

describe('DeleteHarvestUseCase', () => {
  let plantedCropRepository: InMemoryPlantedCropRepository;
  let harvestRepository: InMemoryHarvestRepository;
  let useCase: DeleteHarvestUseCase;

  beforeEach(() => {
    plantedCropRepository = new InMemoryPlantedCropRepository();
    harvestRepository = new InMemoryHarvestRepository(plantedCropRepository);
    useCase = new DeleteHarvestUseCase(harvestRepository);
  });

  it('should be able to delete a harvest and its planted crops', async () => {
    const harvest = await harvestRepository.save(makeHarvest());
    await plantedCropRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );

    await useCase.execute({ id: harvest.id.toString() });

    expect(harvestRepository.items).toHaveLength(0);
    expect(plantedCropRepository.items).toHaveLength(0);
  });

  it('should not be able to delete a missing harvest', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
