import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makeProducer } from '@test/factories/make-producer.factory';
import { InMemoryProducersRepository } from '@test/repositories/in-memory-producers.repository';
import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { CreateFarmUseCase } from './create-farm.use-case';

describe('CreateFarmUseCase', () => {
  let producersRepository: InMemoryProducersRepository;
  let farmsRepository: InMemoryFarmsRepository;
  let useCase: CreateFarmUseCase;

  beforeEach(() => {
    producersRepository = new InMemoryProducersRepository();
    farmsRepository = new InMemoryFarmsRepository(
      new InMemoryHarvestsRepository(new InMemoryPlantedCropsRepository()),
    );
    useCase = new CreateFarmUseCase(farmsRepository, producersRepository);
  });

  it('should be able to create a farm for an existing producer', async () => {
    const producer = await producersRepository.save(makeProducer());
    const farm = await useCase.execute({
      name: 'Fazenda Sol',
      producerId: producer.id.toString(),
      city: 'Goiânia',
      state: 'GO',
      totalArea: 100,
      arableArea: 60,
      vegetationArea: 30,
    });
    const persisted = await farmsRepository.findById(farm.id.toString());
    expect(persisted).not.toBeNull();
    for (const result of [farm, persisted!]) {
      expect(result.name).toBe('Fazenda Sol');
      expect(result.producerId).toBe(producer.id.toString());
      expect(result.city).toBe('Goiânia');
      expect(result.state).toBe('GO');
      expect(result.totalArea.value).toBe(100);
      expect(result.arableArea.value).toBe(60);
      expect(result.vegetationArea.value).toBe(30);
    }
  });

  it('should not be able to create a farm for a missing producer', async () => {
    await expect(
      useCase.execute({
        name: 'Fazenda Sol',
        producerId: 'missing',
        city: 'Goiânia',
        state: 'GO',
        totalArea: 100,
        arableArea: 60,
        vegetationArea: 30,
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
