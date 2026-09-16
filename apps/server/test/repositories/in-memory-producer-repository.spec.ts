import { InMemoryProducersRepository } from './in-memory-producers.repository';
import { makeProducer } from '../factories/make-producer.factory';
import { makeFarm } from '../factories/make-farm.factory';
import { InMemoryFarmsRepository } from './in-memory-farms.repository';
import { InMemoryHarvestsRepository } from './in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from './in-memory-planted-crops.repository';

describe('InMemoryProducersRepository', () => {
  let repository: InMemoryProducersRepository;
  let farmsRepository: InMemoryFarmsRepository;

  beforeEach(() => {
    const plantedCropsRepository = new InMemoryPlantedCropsRepository();
    const harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    farmsRepository = new InMemoryFarmsRepository(harvestsRepository);
    repository = new InMemoryProducersRepository(farmsRepository);
  });

  it('should be able to count producers', async () => {
    await repository.save(makeProducer());
    await repository.save(makeProducer());

    await expect(repository.count()).resolves.toBe(2);
  });

  it('should be able to save and find a producer by id', async () => {
    const producer = await repository.save(makeProducer());
    await expect(repository.findById(producer.id.toString())).resolves.toBe(producer);
  });

  it('should be able to find producers with partial unified search and pagination', async () => {
    repository.items = [
      makeProducer({ name: 'Maria Silva' }),
      makeProducer({ name: 'João Souza' }),
    ];

    const result = await repository.findMany({ search: 'sil', page: 1, perPage: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].producer.name).toBe('Maria Silva');
    expect(result.total).toBe(1);
  });

  it('should be able to find producers by a formatted document with unified search', async () => {
    const producer = await repository.save(
      makeProducer({ name: 'Producer by document', document: '529.982.247-25' }),
    );

    const result = await repository.findMany({ search: '529.982.247-2', page: 1, perPage: 10 });

    expect(result.items.map((item) => item.producer)).toEqual([producer]);
  });

  it('should be able to match name or document with unified search', async () => {
    const nameMatch = makeProducer({ name: 'Maria Silva', document: '52998224725' });
    const documentMatch = makeProducer({ name: 'João Souza', document: '11144477735' });
    repository.items = [nameMatch, documentMatch];

    const result = await repository.findMany({ search: 'sil', page: 1, perPage: 10 });
    const documentResult = await repository.findMany({ search: '444777', page: 1, perPage: 10 });

    expect(result.items.map((item) => item.producer)).toEqual([nameMatch]);
    expect(documentResult.items.map((item) => item.producer)).toEqual([documentMatch]);
  });

  it('should be able to find a producer by normalized document', async () => {
    const producer = await repository.save(makeProducer({ document: '529.982.247-25' }));
    await expect(repository.findByDocument('52998224725')).resolves.toBe(producer);
  });

  it('should be able to list newest producers first', async () => {
    const older = makeProducer({ name: 'Older', createdAt: new Date('2026-01-01') });
    const newer = makeProducer({ name: 'Newer', createdAt: new Date('2026-02-01') });

    repository.items = [older, newer];

    const result = await repository.findMany({ page: 1, perPage: 10 });

    expect(result.items.map((item) => item.producer.name)).toEqual(['Newer', 'Older']);
  });

  it('should be able to count farms for each producer', async () => {
    const producer = makeProducer();
    repository.items = [producer];
    farmsRepository.items = [
      makeFarm({ producerId: producer.id.toString() }),
      makeFarm({ producerId: producer.id.toString() }),
      makeFarm({ producerId: 'another-producer' }),
    ];

    const result = await repository.findMany({ page: 1, perPage: 10 });

    expect(result.items[0].farmsCount).toBe(2);
  });
});
