import { InMemoryProducerRepository } from '@test/repositories/in-memory-producer-repository';
import { DocumentAlreadyUsedError } from '../errors/document-already-used-error';
import { CreateProducerUseCase } from './create-producer.use-case';
import { makeProducer } from '@test/factories/make-producer.factory';
import { cnpj } from 'cpf-cnpj-validator';
import { DocumentValidationError } from '../../domain/errors/document-validation-error';

describe('CreateProducerUseCase', () => {
  let repository: InMemoryProducerRepository;
  let useCase: CreateProducerUseCase;

  beforeEach(() => {
    repository = new InMemoryProducerRepository();
    useCase = new CreateProducerUseCase(repository);
  });

  it('should be able to create a producer with CPF', async () => {
    const producer = await useCase.execute({
      name: 'Maria Silva',
      document: '529.982.247-25',
    });
    const persistedProducer = await repository.findById(producer.id.toString());

    expect(persistedProducer?.name).toBe('Maria Silva');
    expect(persistedProducer?.document.value).toBe('52998224725');
    expect(persistedProducer?.id).toBe(producer.id);
  });

  it('should be able to create a producer with a CNPJ', async () => {
    const document = cnpj.generate();
    const producer = await useCase.execute({ name: 'Empresa Rural', document });

    expect(producer.document.value).toBe(document);
    await expect(repository.findById(producer.id.toString())).resolves.toEqual(producer);
  });

  it('should not be able to create a producer with an invalid document', async () => {
    await expect(
      useCase.execute({ name: 'Maria Silva', document: 'invalid-document' }),
    ).rejects.toBeInstanceOf(DocumentValidationError);
    expect(repository.items).toHaveLength(0);
  });

  it('should not be able to create a producer with a duplicate document', async () => {
    const producer = await repository.save(makeProducer());
    await expect(
      useCase.execute({ name: 'João Souza', document: producer.document.value }),
    ).rejects.toBeInstanceOf(DocumentAlreadyUsedError);
    expect(repository.items).toHaveLength(1);
  });
});
