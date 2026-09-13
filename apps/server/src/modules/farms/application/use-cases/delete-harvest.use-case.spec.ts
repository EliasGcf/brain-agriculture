import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { makeHarvest } from '@test/factories/make-harvest.factory';
import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { DeleteHarvestUseCase } from './delete-harvest.use-case';

describe('DeleteHarvestUseCase', () => {
  let plantedCropsRepository: InMemoryPlantedCropsRepository;
  let harvestsRepository: InMemoryHarvestsRepository;
  let useCase: DeleteHarvestUseCase;

  beforeEach(() => {
    plantedCropsRepository = new InMemoryPlantedCropsRepository();
    harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    useCase = new DeleteHarvestUseCase(harvestsRepository);
  });

  it('should be able to delete a harvest and its planted crops', async () => {
    const harvest = await harvestsRepository.save(makeHarvest());
    await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );

    await useCase.execute({ id: harvest.id.toString() });

    expect(harvestsRepository.items).toHaveLength(0);
    expect(plantedCropsRepository.items).toHaveLength(0);
  });

  it('should not be able to delete a missing harvest', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
