import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makeHarvest } from '@test/factories/make-harvest.factory';
import { InMemoryHarvestRepository } from '@test/repositories/in-memory-harvest-repository';
import { InMemoryPlantedCropRepository } from '@test/repositories/in-memory-planted-crop-repository';
import { CreatePlantedCropUseCase } from './create-planted-crop.use-case';

describe('CreatePlantedCropUseCase', () => {
  let harvestRepository: InMemoryHarvestRepository;
  let plantedCropRepository: InMemoryPlantedCropRepository;
  let useCase: CreatePlantedCropUseCase;

  beforeEach(() => {
    plantedCropRepository = new InMemoryPlantedCropRepository();
    harvestRepository = new InMemoryHarvestRepository(plantedCropRepository);
    useCase = new CreatePlantedCropUseCase(plantedCropRepository, harvestRepository);
  });

  it('should be able to create a planted crop for an existing harvest', async () => {
    const harvest = await harvestRepository.save(makeHarvest({ farmId: 'farm-1' }));

    const crop = await useCase.execute({
      name: 'Soja',
      harvestId: harvest.id.toString(),
    });

    expect(crop.name).toBe('Soja');
    expect(crop.harvestId).toBe(harvest.id.toString());
    const persisted = await plantedCropRepository.findById(crop.id.toString());
    expect(persisted?.name).toBe('Soja');
    expect(persisted?.harvestId).toBe(harvest.id.toString());
  });

  it('should not be able to create a planted crop for a missing harvest', async () => {
    await expect(
      useCase.execute({ name: 'Soja', harvestId: 'missing' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
