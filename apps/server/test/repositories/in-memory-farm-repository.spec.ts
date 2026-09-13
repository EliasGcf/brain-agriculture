import { makePlantedCrop } from '../factories/make-planted-crop.factory';
import { Farm } from '@modules/farms/domain/entities/farm';
import { makeFarm } from '../factories/make-farm.factory';
import { makeHarvest } from '../factories/make-harvest.factory';
import { InMemoryFarmRepository } from './in-memory-farm-repository';
import { InMemoryHarvestRepository } from './in-memory-harvest-repository';
import { InMemoryPlantedCropRepository } from './in-memory-planted-crop-repository';

describe('InMemoryFarmRepository', () => {
  let plantedCropRepository: InMemoryPlantedCropRepository;
  let harvestRepository: InMemoryHarvestRepository;
  let farmRepository: InMemoryFarmRepository;

  beforeEach(() => {
    plantedCropRepository = new InMemoryPlantedCropRepository();
    harvestRepository = new InMemoryHarvestRepository(plantedCropRepository);
    farmRepository = new InMemoryFarmRepository(harvestRepository);
  });

  it('should be able to save and find a farm by id', async () => {
    const farm = await farmRepository.save(makeFarm());
    await expect(farmRepository.findById(farm.id.toString())).resolves.toBe(farm);
  });

  it('should be able to replace a farm when saving an existing id', async () => {
    const farm = await farmRepository.save(makeFarm());
    const replacement = Farm.create(
      {
        name: 'Updated farm',
        producerId: farm.producerId,
        city: farm.city,
        state: farm.state,
        totalArea: farm.totalArea,
        arableArea: farm.arableArea,
        vegetationArea: farm.vegetationArea,
        createdAt: farm.createdAt,
      },
      farm.id,
    );

    await farmRepository.save(replacement);

    const persisted = await farmRepository.findById(farm.id.toString());
    expect(persisted?.name).toBe('Updated farm');
    expect(farmRepository.items).toEqual([replacement]);
  });

  it('should be able to cascade farm deletion to its harvests and planted crops', async () => {
    const farm = makeFarm();
    const harvest = makeHarvest({ farmId: farm.id.toString() });

    await farmRepository.save(farm);
    await harvestRepository.save(harvest);
    const crop = await plantedCropRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );

    await farmRepository.deleteById(farm.id.toString());

    expect(farmRepository.items).toHaveLength(0);
    expect(harvestRepository.items).toHaveLength(0);
    await expect(plantedCropRepository.findById(crop.id.toString())).resolves.toBeNull();
  });
});
