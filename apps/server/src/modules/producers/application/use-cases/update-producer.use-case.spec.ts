import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { UpdateProducerUseCase } from './update-producer.use-case';
import { InMemoryProducersRepository } from '@test/repositories/in-memory-producers.repository';
import { makeProducer } from '@test/factories/make-producer.factory';
import { DocumentAlreadyUsedError } from '../errors/document-already-used-error';
import { DocumentValidationError } from '../../domain/errors/document-validation-error';

describe('UpdateProducerUseCase', () => {
  let repository: InMemoryProducersRepository;
  let useCase: UpdateProducerUseCase;

  beforeEach(() => {
    const plantedCropsRepository = new InMemoryPlantedCropsRepository();
    const harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    const farmsRepository = new InMemoryFarmsRepository(harvestsRepository);
    repository = new InMemoryProducersRepository(farmsRepository);
    useCase = new UpdateProducerUseCase(repository);
  });

  it('should be able to update a producer name and document', async () => {
    const producer = await repository.save(makeProducer({ document: '11144477735' }));
    const result = await useCase.execute({
      id: producer.id.toString(),
      name: 'Maria Silva',
      document: '529.982.247-25',
    });
    const persistedProducer = await repository.findById(producer.id.toString());

    expect(result.name).toBe('Maria Silva');
    expect(result.document.value).toBe('52998224725');
    expect(result.id).toBe(producer.id);
    expect(result.createdAt).toBe(producer.createdAt);
    expect(persistedProducer?.name).toBe('Maria Silva');
    expect(persistedProducer?.document.value).toBe('52998224725');
    expect(persistedProducer?.document.value).not.toBe('11144477735');
  });

  it('should be able to update a producer document', async () => {
    const producer = await repository.save(makeProducer({ document: '11144477735' }));
    const result = await useCase.execute({
      id: producer.id.toString(),
      document: '529.982.247-25',
    });
    const persistedProducer = await repository.findById(producer.id.toString());

    expect(result.name).toBe(producer.name);
    expect(result.id).toBe(producer.id);
    expect(result.createdAt).toBe(producer.createdAt);
    expect(persistedProducer?.name).toBe(producer.name);
    expect(result.document.value).toBe('52998224725');
    expect(result.document.value).not.toBe('11144477735');
    expect(persistedProducer?.document.value).toBe('52998224725');
  });

  it('should not be able to update a producer with an invalid document', async () => {
    const producer = await repository.save(makeProducer({ document: '11144477735' }));
    await expect(
      useCase.execute({ id: producer.id.toString(), document: 'invalid-document' }),
    ).rejects.toBeInstanceOf(DocumentValidationError);

    const persistedProducer = await repository.findById(producer.id.toString());
    expect(persistedProducer?.document.value).toBe(producer.document.value);
  });

  it('should not be able to update a missing producer', async () => {
    await expect(
      useCase.execute({ id: 'missing', name: 'Maria' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to update a producer with a document already in use', async () => {
    const producer = await repository.save(makeProducer({ document: '11144477735' }));
    const otherProducer = await repository.save(
      makeProducer({ document: '52998224725' }),
    );
    await expect(
      useCase.execute({
        id: producer.id.toString(),
        document: otherProducer.document.value,
        name: 'Rejected name',
      }),
    ).rejects.toBeInstanceOf(DocumentAlreadyUsedError);

    const persistedProducer = await repository.findById(producer.id.toString());
    expect(persistedProducer?.document.value).toBe(producer.document.value);
    expect(persistedProducer?.name).toBe(producer.name);
  });

  it('should be able to update only the producer name while preserving other fields', async () => {
    const producer = await repository.save(makeProducer({ document: '11144477735' }));
    const result = await useCase.execute({
      id: producer.id.toString(),
      name: 'Maria Souza',
    });
    const persisted = await repository.findById(producer.id.toString());

    expect(result.name).toBe('Maria Souza');
    expect(result.document.value).toBe('11144477735');
    expect(result.id).toBe(producer.id);
    expect(result.createdAt).toBe(producer.createdAt);
    expect(persisted?.name).toBe('Maria Souza');
    expect(persisted?.document.value).toBe('11144477735');
    expect(persisted?.createdAt).toBe(producer.createdAt);
  });
});
