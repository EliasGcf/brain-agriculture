import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { UpdateProducerUseCase } from './update-producer.use-case';
import { InMemoryProducerRepository } from '@test/repositories/in-memory-producer-repository';
import { makeProducer } from '@test/factories/make-producer.factory';
import { DocumentAlreadyUsedError } from '../errors/document-already-used-error';
import { DocumentValidationError } from '../../domain/errors/document-validation-error';

describe('UpdateProducerUseCase', () => {
  let repository: InMemoryProducerRepository;
  let useCase: UpdateProducerUseCase;

  beforeEach(() => {
    repository = new InMemoryProducerRepository();
    useCase = new UpdateProducerUseCase(repository);
  });

  it('should be able to update a producer partially', async () => {
    const producer = await repository.save(makeProducer());
    const originalDocument = producer.document.value;
    const originalCreatedAt = producer.createdAt;
    const result = await useCase.execute({
      id: producer.id.toString(),
      name: 'Maria Silva',
      document: '529.982.247-25',
    });
    const persistedProducer = await repository.findById(producer.id.toString());

    expect(result.name).toBe('Maria Silva');
    expect(result.document.value).toBe('52998224725');
    expect(result.id).toBe(producer.id);
    expect(result.createdAt).toBe(originalCreatedAt);
    expect(persistedProducer?.name).toBe('Maria Silva');
    expect(persistedProducer?.document.value).toBe('52998224725');
    expect(persistedProducer?.document.value).not.toBe(originalDocument);
  });

  it('should be able to update a producer document', async () => {
    const producer = await repository.save(makeProducer());
    const originalDocument = producer.document.value;

    const result = await useCase.execute({
      id: producer.id.toString(),
      document: '529.982.247-25',
    });
    const persistedProducer = await repository.findById(producer.id.toString());

    expect(result.document.value).toBe('52998224725');
    expect(result.document.value).not.toBe(originalDocument);
    expect(persistedProducer?.document.value).toBe('52998224725');
  });

  it('should not be able to update a producer with an invalid document', async () => {
    const producer = await repository.save(makeProducer());
    const originalDocument = producer.document.value;

    await expect(
      useCase.execute({ id: producer.id.toString(), document: 'invalid-document' }),
    ).rejects.toBeInstanceOf(DocumentValidationError);

    const persistedProducer = await repository.findById(producer.id.toString());
    expect(persistedProducer?.document.value).toBe(originalDocument);
  });

  it('should not be able to update a missing producer', async () => {
    await expect(
      useCase.execute({ id: 'missing', name: 'Maria' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to update a producer with a document already in use', async () => {
    const producer = await repository.save(makeProducer());
    const otherProducer = await repository.save(makeProducer());

    await expect(
      useCase.execute({
        id: producer.id.toString(),
        document: otherProducer.document.value,
      }),
    ).rejects.toBeInstanceOf(DocumentAlreadyUsedError);

    const persistedProducer = await repository.findById(producer.id.toString());
    expect(persistedProducer?.document.value).toBe(producer.document.value);
  });
});
