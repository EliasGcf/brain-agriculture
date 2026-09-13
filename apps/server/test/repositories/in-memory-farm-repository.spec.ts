import { makePlantedCrop } from '../factories/make-planted-crop.factory';
import { Farm } from '@modules/farms/domain/entities/farm';
import { makeFarm } from '../factories/make-farm.factory';
import { makeHarvest } from '../factories/make-harvest.factory';
import { InMemoryFarmsRepository } from './in-memory-farms.repository';
import { InMemoryHarvestsRepository } from './in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from './in-memory-planted-crops.repository';

describe('InMemoryFarmsRepository', () => {
  let plantedCropsRepository: InMemoryPlantedCropsRepository;
  let harvestsRepository: InMemoryHarvestsRepository;
  let farmsRepository: InMemoryFarmsRepository;

  beforeEach(() => {
    plantedCropsRepository = new InMemoryPlantedCropsRepository();
    harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    farmsRepository = new InMemoryFarmsRepository(harvestsRepository);
  });

  it('should be able to save and find a farm by id', async () => {
    const farm = await farmsRepository.save(makeFarm());
    await expect(farmsRepository.findById(farm.id.toString())).resolves.toBe(farm);
  });

  it('should be able to replace a farm when saving an existing id', async () => {
    const farm = await farmsRepository.save(makeFarm());
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

    await farmsRepository.save(replacement);

    const persisted = await farmsRepository.findById(farm.id.toString());
    expect(persisted?.name).toBe('Updated farm');
    expect(farmsRepository.items).toEqual([replacement]);
  });

  it('should be able to cascade farm deletion to its harvests and planted crops', async () => {
    const farm = makeFarm();
    const harvest = makeHarvest({ farmId: farm.id.toString() });

    await farmsRepository.save(farm);
    await harvestsRepository.save(harvest);
    const crop = await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: harvest.id.toString() }),
    );

    await farmsRepository.deleteById(farm.id.toString());

    expect(farmsRepository.items).toHaveLength(0);
    expect(harvestsRepository.items).toHaveLength(0);
    await expect(plantedCropsRepository.findById(crop.id.toString())).resolves.toBeNull();
  });
});
