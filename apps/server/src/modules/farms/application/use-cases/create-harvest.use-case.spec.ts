import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makeFarm } from '@test/factories/make-farm.factory';
import { InMemoryFarmRepository } from '@test/repositories/in-memory-farm-repository';
import { InMemoryHarvestRepository } from '@test/repositories/in-memory-harvest-repository';
import { InMemoryPlantedCropRepository } from '@test/repositories/in-memory-planted-crop-repository';
import { CreateHarvestUseCase } from './create-harvest.use-case';

describe('CreateHarvestUseCase', () => {
  let farmRepository: InMemoryFarmRepository;
  let harvestRepository: InMemoryHarvestRepository;
  let useCase: CreateHarvestUseCase;

  beforeEach(() => {
    const plantedCropRepository = new InMemoryPlantedCropRepository();
    harvestRepository = new InMemoryHarvestRepository(plantedCropRepository);
    farmRepository = new InMemoryFarmRepository(harvestRepository);
    useCase = new CreateHarvestUseCase(harvestRepository, farmRepository);
  });

  it('should be able to create a harvest for an existing farm', async () => {
    const farm = await farmRepository.save(makeFarm({ producerId: 'producer-1' }));
    const harvest = await useCase.execute({
      name: 'Safra 2026',
      farmId: farm.id.toString(),
    });
    expect(harvest.name).toBe('Safra 2026');
    expect(harvest.farmId).toBe(farm.id.toString());
    const persisted = await harvestRepository.findById(harvest.id.toString());
    expect(persisted?.name).toBe('Safra 2026');
    expect(persisted?.farmId).toBe(farm.id.toString());
  });

  it('should not be able to create a harvest for a missing farm', async () => {
    await expect(
      useCase.execute({
        name: 'Safra',
        farmId: 'missing',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
