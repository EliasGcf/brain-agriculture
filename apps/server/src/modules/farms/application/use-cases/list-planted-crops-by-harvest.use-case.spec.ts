import { makeHarvest } from '@test/factories/make-harvest.factory';
import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { ListPlantedCropsByHarvestUseCase } from './list-planted-crops-by-harvest.use-case';

describe('ListPlantedCropsByHarvestUseCase', () => {
  let harvestsRepository: InMemoryHarvestsRepository;
  let plantedCropsRepository: InMemoryPlantedCropsRepository;
  let useCase: ListPlantedCropsByHarvestUseCase;

  beforeEach(() => {
    plantedCropsRepository = new InMemoryPlantedCropsRepository();
    harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    useCase = new ListPlantedCropsByHarvestUseCase(plantedCropsRepository);
  });

  it('should be able to list a harvest planted crops', async () => {
    const harvest = await harvestsRepository.save(makeHarvest());
    const crop = await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );

    await expect(useCase.execute({ harvestId: harvest.id.toString() })).resolves.toEqual([
      crop,
    ]);
  });

  it('should be able to list an empty collection for a missing harvest', async () => {
    await expect(useCase.execute({ harvestId: 'missing' })).resolves.toEqual([]);
  });

  it('should be able to list an empty collection for a harvest without planted crops', async () => {
    const harvest = await harvestsRepository.save(makeHarvest());

    await expect(useCase.execute({ harvestId: harvest.id.toString() })).resolves.toEqual(
      [],
    );
  });
});
