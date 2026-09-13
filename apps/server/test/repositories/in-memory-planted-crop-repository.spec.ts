import { makePlantedCrop } from '../factories/make-planted-crop.factory';
import { InMemoryPlantedCropsRepository } from './in-memory-planted-crops.repository';

describe('InMemoryPlantedCropsRepository', () => {
  let repository: InMemoryPlantedCropsRepository;

  beforeEach(() => {
    repository = new InMemoryPlantedCropsRepository();
  });

  it('should be able to save and find a planted crop by id', async () => {
    const crop = await repository.save(makePlantedCrop());
    await expect(repository.findById(crop.id.toString())).resolves.toBe(crop);
  });

  it('should be able to find crops by harvest', async () => {
    const crop = await repository.save(makePlantedCrop({ harvestId: 'harvest-1' }));

    await expect(repository.findManyByHarvestId('harvest-1')).resolves.toEqual([crop]);
    await expect(repository.findManyByHarvestId('other-harvest')).resolves.toEqual([]);
  });
});
