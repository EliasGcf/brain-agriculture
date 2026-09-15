import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { InMemoryProducersRepository } from '@test/repositories/in-memory-producers.repository';
import { makeProducer } from '@test/factories/make-producer.factory';
import { GetProducerByIdUseCase } from './get-producer-by-id.use-case';

describe('GetProducerByIdUseCase', () => {
  let repository: InMemoryProducersRepository;
  let useCase: GetProducerByIdUseCase;

  beforeEach(() => {
    const plantedCropsRepository = new InMemoryPlantedCropsRepository();
    const harvestsRepository = new InMemoryHarvestsRepository(plantedCropsRepository);
    const farmsRepository = new InMemoryFarmsRepository(harvestsRepository);
    repository = new InMemoryProducersRepository(farmsRepository);
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
