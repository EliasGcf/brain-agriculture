import { InMemoryProducersRepository } from './in-memory-producers.repository';
import { makeProducer } from '../factories/make-producer.factory';

describe('InMemoryProducersRepository', () => {
  let repository: InMemoryProducersRepository;

  beforeEach(() => {
    repository = new InMemoryProducersRepository();
  });

  it('should be able to save and find a producer by id', async () => {
    const producer = await repository.save(makeProducer());
    await expect(repository.findById(producer.id.toString())).resolves.toBe(producer);
  });

  it('should be able to find producers with partial filters and pagination', async () => {
    repository.items = [
      makeProducer({ name: 'Maria Silva' }),
      makeProducer({ name: 'João Souza' }),
    ];

    const result = await repository.findMany({ name: 'sil', page: 1, perPage: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Maria Silva');
    expect(result.total).toBe(1);
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

    expect(result.items.map((item) => item.name)).toEqual(['Newer', 'Older']);
  });
});
