import { makeFarm } from '@test/factories/make-farm.factory';
import { makeProducer } from '@test/factories/make-producer.factory';
import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { InMemoryProducersRepository } from '@test/repositories/in-memory-producers.repository';
import { ListFarmsByProducerUseCase } from './list-farms-by-producer.use-case';

describe('ListFarmsByProducerUseCase', () => {
  let producersRepository: InMemoryProducersRepository;
  let farmsRepository: InMemoryFarmsRepository;
  let useCase: ListFarmsByProducerUseCase;

  beforeEach(() => {
    const plantedCropsRepository = new InMemoryPlantedCropsRepository();
    const harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    farmsRepository = new InMemoryFarmsRepository(harvestsRepository);
    producersRepository = new InMemoryProducersRepository(farmsRepository);
    useCase = new ListFarmsByProducerUseCase(farmsRepository);
  });

  it('should be able to list a producer farms', async () => {
    const producer = await producersRepository.save(makeProducer());
    const farm = await farmsRepository.save(
      makeFarm({ producerId: producer.id.toString() }),
    );

    await expect(
      useCase.execute({ producerId: producer.id.toString() }),
    ).resolves.toEqual([farm]);
  });

  it('should be able to list an empty collection for a missing producer', async () => {
    await expect(useCase.execute({ producerId: 'missing' })).resolves.toEqual([]);
  });

  it('should be able to list an empty collection for a producer without farms', async () => {
    const producer = await producersRepository.save(makeProducer());

    await expect(
      useCase.execute({ producerId: producer.id.toString() }),
    ).resolves.toEqual([]);
  });
});
