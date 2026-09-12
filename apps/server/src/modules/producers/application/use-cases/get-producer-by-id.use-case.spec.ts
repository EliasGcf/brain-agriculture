import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { InMemoryProducerRepository } from '@test/repositories/in-memory-producer-repository';
import { makeProducer } from '@test/factories/make-producer.factory';
import { GetProducerByIdUseCase } from './get-producer-by-id.use-case';

describe('GetProducerByIdUseCase', () => {
  let repository: InMemoryProducerRepository;
  let useCase: GetProducerByIdUseCase;

  beforeEach(() => {
    repository = new InMemoryProducerRepository();
    useCase = new GetProducerByIdUseCase(repository);
  });

  it('should be able to get a producer by id', async () => {
    const producer = await repository.save(makeProducer());
    const result = await useCase.execute({ id: producer.id.toString() });
    expect(result).toEqual(producer);
  });

  it('should not be able to get a missing producer', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
