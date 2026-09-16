import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { InMemoryProducersRepository } from '@test/repositories/in-memory-producers.repository';
import { makeFarm } from '@test/factories/make-farm.factory';
import { makeHarvest } from '@test/factories/make-harvest.factory';
import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';
import { makeProducer } from '@test/factories/make-producer.factory';
import { Area } from '@modules/farms/domain/value-objects/area';
import { GetDashboardMetricsUseCase } from './get-dashboard-metrics.use-case';

describe('should be able to get dashboard metrics', () => {
  let farmsRepository: InMemoryFarmsRepository;
  let producersRepository: InMemoryProducersRepository;
  let harvestsRepository: InMemoryHarvestsRepository;
  let plantedCropsRepository: InMemoryPlantedCropsRepository;
  let useCase: GetDashboardMetricsUseCase;

  beforeEach(() => {
    plantedCropsRepository = new InMemoryPlantedCropsRepository();
    harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    farmsRepository = new InMemoryFarmsRepository(harvestsRepository);
    producersRepository = new InMemoryProducersRepository(farmsRepository);
    useCase = new GetDashboardMetricsUseCase(producersRepository, farmsRepository);
  });

  it('should be able to return the global dashboard metrics', async () => {
    const producer = await producersRepository.save(makeProducer());
    const farm = await farmsRepository.save(
      makeFarm({
        producerId: producer.id.toString(),
        totalArea: Area.create(100),
        arableArea: Area.create(60),
        vegetationArea: Area.create(20),
      }),
    );
    farm.update({ state: 'BA' });
    await farmsRepository.save(farm);
    const harvest = await harvestsRepository.save(
      makeHarvest({ farmId: farm.id.toString() }),
    );
    const crop = makePlantedCrop({ harvestId: harvest.id.toString() });
    crop.update({ name: 'Soja' });
    await plantedCropsRepository.save(crop);

    await expect(useCase.execute()).resolves.toEqual({
      farmCount: 1,
      producerCount: 1,
      totalHectares: 100,
      hectaresByState: [{ state: 'BA', hectares: 100 }],
      farmsByCrop: [{ crop: 'Soja', farms: 1 }],
      landUse: { arableArea: 60, vegetationArea: 20, otherUses: 20 },
    });
  });

  it('should be able to count a crop once when it is registered in multiple harvests of a farm', async () => {
    const producer = await producersRepository.save(makeProducer());
    const firstFarm = await farmsRepository.save(makeFarm({ producerId: producer.id.toString() }));
    const secondFarm = await farmsRepository.save(makeFarm({ producerId: producer.id.toString() }));
    const firstHarvest = await harvestsRepository.save(
      makeHarvest({ farmId: firstFarm.id.toString() }),
    );
    const secondHarvest = await harvestsRepository.save(
      makeHarvest({ farmId: firstFarm.id.toString() }),
    );
    const unrelatedHarvest = await harvestsRepository.save(
      makeHarvest({ farmId: secondFarm.id.toString() }),
    );

    await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: firstHarvest.id.toString(), name: ' Soja ' }),
    );
    await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: secondHarvest.id.toString(), name: 'soja' }),
    );
    await plantedCropsRepository.save(
      makePlantedCrop({ harvestId: unrelatedHarvest.id.toString(), name: 'SOJA' }),
    );

    await expect(useCase.execute()).resolves.toEqual(
      expect.objectContaining({ farmsByCrop: [{ crop: 'Soja', farms: 2 }] }),
    );
  });
});
