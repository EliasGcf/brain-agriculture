import { makeFarm } from '@test/factories/make-farm.factory';
import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { InMemoryProducersRepository } from '@test/repositories/in-memory-producers.repository';
import { makeProducer } from '@test/factories/make-producer.factory';
import { ListFarmsUseCase } from './list-farms.use-case';

describe('ListFarmsUseCase', () => {
  let repository: InMemoryFarmsRepository;
  let producersRepository: InMemoryProducersRepository;
  let useCase: ListFarmsUseCase;

  beforeEach(() => {
    const plantedCropsRepository = new InMemoryPlantedCropsRepository();
    const harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    repository = new InMemoryFarmsRepository(harvestsRepository);
    producersRepository = new InMemoryProducersRepository(repository);
    useCase = new ListFarmsUseCase(repository);
  });

  it('should be able to list farms with filters and pagination', async () => {
    const producer = await producersRepository.save(makeProducer());
    const producerId = producer.id.toString();
    const matchingFarm = makeFarm({
      name: 'Green Valley',
      producerId,
      city: 'Sao Paulo',
      state: 'SP',
    });
    repository.items = [
      matchingFarm,
      makeFarm({ name: 'Green Valley North', producerId, city: 'Campinas', state: 'SP' }),
      makeFarm({ name: 'Other Farm', producerId: 'producer-2', city: 'Sao Paulo', state: 'SP' }),
    ];

    const result = await useCase.execute({
      name: 'green',
      producerId,
      city: 'sao',
      state: 'sp',
      page: 1,
      perPage: 1,
    });

    expect(result).toEqual({ items: [{ farm: matchingFarm, owner: producer }], total: 1 });
  });
});
