import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makeHarvest } from '@test/factories/make-harvest.factory';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { CreatePlantedCropUseCase } from './create-planted-crop.use-case';

describe('CreatePlantedCropUseCase', () => {
  let harvestsRepository: InMemoryHarvestsRepository;
  let plantedCropsRepository: InMemoryPlantedCropsRepository;
  let useCase: CreatePlantedCropUseCase;

  beforeEach(() => {
    plantedCropsRepository = new InMemoryPlantedCropsRepository();
    harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    useCase = new CreatePlantedCropUseCase(plantedCropsRepository, harvestsRepository);
  });

  it('should be able to create a planted crop for an existing harvest', async () => {
    const harvest = await harvestsRepository.save(makeHarvest({ farmId: 'farm-1' }));

    const crop = await useCase.execute({
      name: 'Soja',
      harvestId: harvest.id.toString(),
    });

    expect(crop.name).toBe('Soja');
    expect(crop.harvestId).toBe(harvest.id.toString());
    const persisted = await plantedCropsRepository.findById(crop.id.toString());
    expect(persisted?.name).toBe('Soja');
    expect(persisted?.harvestId).toBe(harvest.id.toString());
  });

  it('should not be able to create a planted crop for a missing harvest', async () => {
    await expect(
      useCase.execute({ name: 'Soja', harvestId: 'missing' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
