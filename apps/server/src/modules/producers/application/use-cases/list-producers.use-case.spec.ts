import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { InMemoryProducersRepository } from '@test/repositories/in-memory-producers.repository';
import { makeProducer } from '@test/factories/make-producer.factory';
import { ListProducersUseCase } from './list-producers.use-case';

describe('ListProducersUseCase', () => {
  let repository: InMemoryProducersRepository;
  let useCase: ListProducersUseCase;

  beforeEach(() => {
    const plantedCropsRepository = new InMemoryPlantedCropsRepository();
    const harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    const farmsRepository = new InMemoryFarmsRepository(harvestsRepository);
    repository = new InMemoryProducersRepository(farmsRepository);
    useCase = new ListProducersUseCase(repository);
  });

  it('should be able to list producers with filters and pagination', async () => {
    const oldest = makeProducer({
      name: 'Maria Silva',
      document: '52998224725',
      createdAt: new Date('2026-01-01'),
    });
    const middle = makeProducer({
      name: 'João Souza',
      document: '11144477735',
      createdAt: new Date('2026-02-01'),
    });
    const newest = makeProducer({
      name: 'Ana Oliveira',
      document: '52998224725',
      createdAt: new Date('2026-03-01'),
    });
    repository.items = [oldest, middle, newest];

    const nameResult = await useCase.execute({ name: 'sil', page: 1, perPage: 10 });
    expect(nameResult.items).toHaveLength(1);
    expect(nameResult.items[0].producer).toBe(oldest);
    expect(nameResult.total).toBe(1);

    const documentResult = await useCase.execute({
      document: '444777',
      page: 1,
      perPage: 10,
    });
    expect(documentResult.items).toHaveLength(1);
    expect(documentResult.items[0].producer).toBe(middle);
    expect(documentResult.total).toBe(1);

    const paginatedResult = await useCase.execute({ page: 1, perPage: 2 });
    expect(paginatedResult.items.map((item) => item.producer)).toEqual([newest, middle]);
    expect(paginatedResult.items.map((item) => item.producer)).not.toContain(oldest);
    expect(paginatedResult.total).toBe(3);

    const nextPageResult = await useCase.execute({ page: 2, perPage: 2 });
    expect(nextPageResult.items.map((item) => item.producer)).toEqual([oldest]);
    expect(nextPageResult.total).toBe(3);
  });
});
