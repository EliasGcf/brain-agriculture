import { makeHarvest } from '../factories/make-harvest.factory';
import { makePlantedCrop } from '../factories/make-planted-crop.factory';
import { InMemoryHarvestRepository } from './in-memory-harvest-repository';
import { InMemoryPlantedCropRepository } from './in-memory-planted-crop-repository';

describe('InMemoryHarvestRepository', () => {
  let plantedCropRepository: InMemoryPlantedCropRepository;
  let harvestRepository: InMemoryHarvestRepository;

  beforeEach(() => {
    plantedCropRepository = new InMemoryPlantedCropRepository();
    harvestRepository = new InMemoryHarvestRepository(plantedCropRepository);
  });

  it('should be able to save and find a harvest by id', async () => {
    const harvest = await harvestRepository.save(makeHarvest());
    await expect(harvestRepository.findById(harvest.id.toString())).resolves.toBe(
      harvest,
    );
  });

  it('should be able to find harvests by farm and preserve unrelated records during deletion', async () => {
    const harvest = await harvestRepository.save(makeHarvest());
    const unrelated = await harvestRepository.save(makeHarvest({ farmId: 'farm-2' }));

    await plantedCropRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );
    await harvestRepository.deleteById(harvest.id.toString());

    await expect(harvestRepository.findById(harvest.id.toString())).resolves.toBeNull();
    await expect(harvestRepository.findManyByFarmId('farm-2')).resolves.toEqual([
      unrelated,
    ]);
    expect(plantedCropRepository.items).toHaveLength(0);
  });
});
