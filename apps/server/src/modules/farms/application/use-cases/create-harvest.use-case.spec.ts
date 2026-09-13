import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makeFarm } from '@test/factories/make-farm.factory';
import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { CreateHarvestUseCase } from './create-harvest.use-case';

describe('CreateHarvestUseCase', () => {
  let farmsRepository: InMemoryFarmsRepository;
  let harvestsRepository: InMemoryHarvestsRepository;
  let useCase: CreateHarvestUseCase;

  beforeEach(() => {
    const plantedCropsRepository = new InMemoryPlantedCropsRepository();
    harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    farmsRepository = new InMemoryFarmsRepository(harvestsRepository);
    useCase = new CreateHarvestUseCase(harvestsRepository, farmsRepository);
  });

  it('should be able to create a harvest for an existing farm', async () => {
    const farm = await farmsRepository.save(makeFarm({ producerId: 'producer-1' }));
    const harvest = await useCase.execute({
      name: 'Safra 2026',
      farmId: farm.id.toString(),
    });
    expect(harvest.name).toBe('Safra 2026');
    expect(harvest.farmId).toBe(farm.id.toString());
    const persisted = await harvestsRepository.findById(harvest.id.toString());
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
