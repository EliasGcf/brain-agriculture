import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makeProducer } from '@test/factories/make-producer.factory';
import { InMemoryProducerRepository } from '@test/repositories/in-memory-producer-repository';
import { InMemoryFarmRepository } from '@test/repositories/in-memory-farm-repository';
import { InMemoryHarvestRepository } from '@test/repositories/in-memory-harvest-repository';
import { InMemoryPlantedCropRepository } from '@test/repositories/in-memory-planted-crop-repository';
import { CreateFarmUseCase } from './create-farm.use-case';

describe('CreateFarmUseCase', () => {
  let producerRepository: InMemoryProducerRepository;
  let farmRepository: InMemoryFarmRepository;
  let useCase: CreateFarmUseCase;

  beforeEach(() => {
    producerRepository = new InMemoryProducerRepository();
    farmRepository = new InMemoryFarmRepository(
      new InMemoryHarvestRepository(new InMemoryPlantedCropRepository()),
    );
    useCase = new CreateFarmUseCase(farmRepository, producerRepository);
  });

  it('should be able to create a farm for an existing producer', async () => {
    const producer = await producerRepository.save(makeProducer());
    const farm = await useCase.execute({
      name: 'Fazenda Sol',
      producerId: producer.id.toString(),
      city: 'Goiânia',
      state: 'GO',
      totalArea: 100,
      arableArea: 60,
      vegetationArea: 30,
    });
    const persisted = await farmRepository.findById(farm.id.toString());
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
