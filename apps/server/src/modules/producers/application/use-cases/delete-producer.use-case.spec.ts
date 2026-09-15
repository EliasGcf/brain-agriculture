import { NotAllowedError } from '@core/errors/common/not-allowed.error';
import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { makeFarm } from '@test/factories/make-farm.factory';
import { makeProducer } from '@test/factories/make-producer.factory';
import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { InMemoryProducersRepository } from '@test/repositories/in-memory-producers.repository';
import { DeleteProducerUseCase } from './delete-producer.use-case';

describe('DeleteProducerUseCase', () => {
  let producersRepository: InMemoryProducersRepository;
  let farmsRepository: InMemoryFarmsRepository;
  let useCase: DeleteProducerUseCase;

  beforeEach(() => {
    const plantedCropsRepository = new InMemoryPlantedCropsRepository();
    const harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    farmsRepository = new InMemoryFarmsRepository(harvestsRepository);
    producersRepository = new InMemoryProducersRepository(farmsRepository);
    useCase = new DeleteProducerUseCase(producersRepository, farmsRepository);
  });

  it('should be able to delete a producer without farms', async () => {
    const producer = await producersRepository.save(makeProducer());

    await useCase.execute({ id: producer.id.toString() });

    const deletedProducer = await producersRepository.findById(producer.id.toString());
    expect(deletedProducer).toBeNull();
  });

  it('should not be able to delete a missing producer', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });

  it('should not be able to delete a producer with farms', async () => {
    const producer = await producersRepository.save(makeProducer());
    await farmsRepository.save(makeFarm({ producerId: producer.id.toString() }));

    await expect(useCase.execute({ id: producer.id.toString() })).rejects.toBeInstanceOf(
      NotAllowedError,
    );
  });
});
