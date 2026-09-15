import { makeFarm } from '@test/factories/make-farm.factory';
import { makeHarvest } from '@test/factories/make-harvest.factory';
import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { ListHarvestsByFarmUseCase } from './list-harvests-by-farm.use-case';

describe('ListHarvestsByFarmUseCase', () => {
  let farmsRepository: InMemoryFarmsRepository;
  let harvestsRepository: InMemoryHarvestsRepository;
  let useCase: ListHarvestsByFarmUseCase;

  beforeEach(() => {
    const plantedCropsRepository = new InMemoryPlantedCropsRepository();
    harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    farmsRepository = new InMemoryFarmsRepository(harvestsRepository);
    useCase = new ListHarvestsByFarmUseCase(harvestsRepository);
  });

  it('should be able to list a farm harvests', async () => {
    const farm = await farmsRepository.save(makeFarm());
    const harvest = await harvestsRepository.save(
      makeHarvest({ farmId: farm.id.toString() }),
    );

    const harvests = await useCase.execute({ farmId: farm.id.toString() });
    expect(harvests).toEqual([harvest]);
  });

  it('should be able to list an empty collection for a missing farm', async () => {
    await expect(useCase.execute({ farmId: 'missing' })).resolves.toEqual([]);
  });

  it('should be able to list an empty collection for a farm without harvests', async () => {
    const farm = await farmsRepository.save(makeFarm());
    await expect(useCase.execute({ farmId: farm.id.toString() })).resolves.toEqual([]);
  });
});
