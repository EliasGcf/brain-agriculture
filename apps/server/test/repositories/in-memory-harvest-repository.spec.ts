import { makeHarvest } from '../factories/make-harvest.factory';
import { makePlantedCrop } from '../factories/make-planted-crop.factory';
import { InMemoryHarvestsRepository } from './in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from './in-memory-planted-crops.repository';

describe('InMemoryHarvestsRepository', () => {
  let plantedCropsRepository: InMemoryPlantedCropsRepository;
  let harvestsRepository: InMemoryHarvestsRepository;

  beforeEach(() => {
    plantedCropsRepository = new InMemoryPlantedCropsRepository();
    harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
  });

  it('should be able to save and find a harvest by id', async () => {
    const harvest = await harvestsRepository.save(makeHarvest());
    await expect(harvestsRepository.findById(harvest.id.toString())).resolves.toBe(
      harvest,
    );
  });

  it('should be able to find harvests by farm and preserve unrelated records during deletion', async () => {
    const harvest = await harvestsRepository.save(makeHarvest());
    const unrelated = await harvestsRepository.save(makeHarvest({ farmId: 'farm-2' }));

    await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );
    await harvestsRepository.deleteById(harvest.id.toString());

    await expect(harvestsRepository.findById(harvest.id.toString())).resolves.toBeNull();
    await expect(harvestsRepository.findManyByFarmId('farm-2')).resolves.toEqual([
      unrelated,
    ]);
    expect(plantedCropsRepository.items).toHaveLength(0);
  });
});
