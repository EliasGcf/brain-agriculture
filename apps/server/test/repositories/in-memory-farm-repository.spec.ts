import { makePlantedCrop } from '../factories/make-planted-crop.factory';
import { Farm } from '@modules/farms/domain/entities/farm';
import { makeFarm } from '../factories/make-farm.factory';
import { makeHarvest } from '../factories/make-harvest.factory';
import { InMemoryFarmsRepository } from './in-memory-farms.repository';
import { InMemoryHarvestsRepository } from './in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from './in-memory-planted-crops.repository';
import { InMemoryProducersRepository } from './in-memory-producers.repository';
import { makeProducer } from '../factories/make-producer.factory';
import { Area } from '@modules/farms/domain/value-objects/area';

describe('InMemoryFarmsRepository', () => {
  let plantedCropsRepository: InMemoryPlantedCropsRepository;
  let harvestsRepository: InMemoryHarvestsRepository;
  let farmsRepository: InMemoryFarmsRepository;
  let producersRepository: InMemoryProducersRepository;

  beforeEach(() => {
    plantedCropsRepository = new InMemoryPlantedCropsRepository();
    harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    farmsRepository = new InMemoryFarmsRepository(harvestsRepository);
    producersRepository = new InMemoryProducersRepository(farmsRepository);
  });

  it('should be able to save and find a farm by id', async () => {
    const farm = await farmsRepository.save(makeFarm());
    await expect(farmsRepository.findById(farm.id.toString())).resolves.toBe(farm);
  });

  it('should be able to find farms by producer id', async () => {
    const farm = await farmsRepository.save(makeFarm({ producerId: 'producer-1' }));
    await farmsRepository.save(makeFarm({ producerId: 'producer-2' }));

    await expect(farmsRepository.findManyByProducerId('producer-1')).resolves.toEqual([
      farm,
    ]);
  });

  it('should be able to find farms with partial filters and pagination', async () => {
    const producer = await producersRepository.save(makeProducer());
    const matchingFarm = makeFarm({
      name: 'Green Valley',
      producerId: producer.id.toString(),
      city: 'Sao Paulo',
      state: 'SP',
    });
    farmsRepository.items = [
      matchingFarm,
      makeFarm({ name: 'Green Valley North', producerId: producer.id.toString(), city: 'Campinas', state: 'SP' }),
      makeFarm({ name: 'Other Farm', producerId: 'producer-2', city: 'Sao Paulo', state: 'SP' }),
    ];

    await expect(
      farmsRepository.findMany({
        name: 'green',
        producerId: producer.id.toString(),
        city: 'sao',
        state: 'sp',
        page: 1,
        perPage: 10,
      }),
    ).resolves.toEqual({ items: [{ farm: matchingFarm, owner: producer }], total: 1 });
  });

  it('should be able to aggregate dashboard metrics', async () => {
    const first = makeFarm({ producerId: 'producer-1' });
    const second = makeFarm({ producerId: 'producer-2' });
    await farmsRepository.save(first);
    await farmsRepository.save(second);

    const metrics = await farmsRepository.getDashboardMetrics();

    expect(metrics.farmCount).toBe(2);
    expect(metrics.totalHectares).toBe(first.totalArea.value + second.totalArea.value);
    expect(metrics.landUse.arableArea).toBe(
      first.arableArea.value + second.arableArea.value,
    );
  });

  it('should be able to calculate zero other uses for fractional areas without floating point residue', async () => {
    await farmsRepository.save(
      makeFarm({
        totalArea: Area.create(0.7),
        arableArea: Area.create(0.6),
        vegetationArea: Area.create(0.1),
      }),
    );

    await expect(farmsRepository.getDashboardMetrics()).resolves.toMatchObject({
      totalHectares: 0.7,
      landUse: { arableArea: 0.6, vegetationArea: 0.1, otherUses: 0 },
    });
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
