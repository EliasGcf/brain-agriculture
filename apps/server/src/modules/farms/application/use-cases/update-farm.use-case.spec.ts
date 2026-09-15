import { EntityValidationError } from '@core/errors/common/entity-validation.error';
import { Area } from '@modules/farms/domain/value-objects/area';
import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { makeProducer } from '@test/factories/make-producer.factory';
import { makeFarm } from '@test/factories/make-farm.factory';
import { InMemoryProducersRepository } from '@test/repositories/in-memory-producers.repository';
import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { UpdateFarmUseCase } from './update-farm.use-case';

describe('UpdateFarmUseCase', () => {
  let producersRepository: InMemoryProducersRepository;
  let farmsRepository: InMemoryFarmsRepository;
  let useCase: UpdateFarmUseCase;

  beforeEach(() => {
    farmsRepository = new InMemoryFarmsRepository(
      new InMemoryHarvestsRepository(new InMemoryPlantedCropsRepository()),
    );
    producersRepository = new InMemoryProducersRepository(farmsRepository);
    useCase = new UpdateFarmUseCase(farmsRepository, producersRepository);
  });

  it('should be able to update a farm while preserving identity', async () => {
    const first = await producersRepository.save(makeProducer());
    const second = await producersRepository.save(makeProducer());
    const farm = await farmsRepository.save(
      makeFarm({ producerId: first.id.toString() }),
    );

    const result = await useCase.execute({
      id: farm.id.toString(),
      producerId: second.id.toString(),
      name: 'Nova Fazenda',
      city: 'Brasília',
      state: 'DF',
      totalArea: 200,
      arableArea: 120,
      vegetationArea: 50,
    });

    expect(result.id).toBe(farm.id);
    expect(result.createdAt).toBe(farm.createdAt);
    expect(result.name).toBe('Nova Fazenda');
    expect(result.producerId).toBe(second.id.toString());
    expect(result.city).toBe('Brasília');
    expect(result.state).toBe('DF');
    expect(result.totalArea.value).toBe(200);
    expect(result.arableArea.value).toBe(120);
    expect(result.vegetationArea.value).toBe(50);

    await expect(farmsRepository.findById(farm.id.toString())).resolves.toEqual(result);
  });

  it('should not be able to update a farm to a missing producer', async () => {
    const farm = await farmsRepository.save(makeFarm({ producerId: 'producer-1' }));
    await expect(
      useCase.execute({
        id: farm.id.toString(),
        producerId: 'missing',
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it.each(['arableArea', 'vegetationArea'] as const)(
    'should be able to set %s to zero while preserving omitted fields',
    async (field) => {
      const farm = await farmsRepository.save(
        makeFarm({
          totalArea: Area.create(100),
          arableArea: Area.create(60),
          vegetationArea: Area.create(20),
        }),
      );
      const result = await useCase.execute({ id: farm.id.toString(), [field]: 0 });
      const persisted = await farmsRepository.findById(farm.id.toString());

      expect(result[field].value).toBe(0);
      expect(persisted?.[field].value).toBe(0);
      expect(result.arableArea.value).toBe(field === 'arableArea' ? 0 : 60);
      expect(result.vegetationArea.value).toBe(field === 'vegetationArea' ? 0 : 20);
      expect(result.totalArea.value).toBe(100);
      expect(result.name).toBe(farm.name);
      expect(result.city).toBe(farm.city);
      expect(result.state).toBe(farm.state);
      expect(result.producerId).toBe(farm.producerId);
      expect(result.id).toBe(farm.id);
      expect(result.createdAt).toBe(farm.createdAt);
    },
  );

  it('should be able to reduce total area together with allocated areas', async () => {
    const farm = await farmsRepository.save(
      makeFarm({
        totalArea: Area.create(100),
        arableArea: Area.create(60),
        vegetationArea: Area.create(20),
      }),
    );

    await useCase.execute({
      id: farm.id.toString(),
      totalArea: 10,
      arableArea: 0,
      vegetationArea: 0,
    });

    const persisted = await farmsRepository.findById(farm.id.toString());
    expect(persisted?.totalArea.value).toBe(10);
    expect(persisted?.arableArea.value).toBe(0);
    expect(persisted?.vegetationArea.value).toBe(0);
  });

  it.each([
    { field: 'totalArea', patch: { totalArea: 0 } },
    { field: 'name', patch: { name: '' } },
    { field: 'city', patch: { city: '' } },
    { field: 'state', patch: { state: '' } },
    { field: 'allocated areas exceeding the total', patch: { arableArea: 90 } },
  ])('should not be able to persist invalid $field', async ({ patch }) => {
    const farm = await farmsRepository.save(
      makeFarm({
        totalArea: Area.create(100),
        arableArea: Area.create(60),
        vegetationArea: Area.create(20),
      }),
    );
    await expect(
      useCase.execute({ id: farm.id.toString(), ...patch }),
    ).rejects.toBeInstanceOf(EntityValidationError);

    const persisted = await farmsRepository.findById(farm.id.toString());
    expect(persisted?.name).toBe(farm.name);
    expect(persisted?.city).toBe(farm.city);
    expect(persisted?.state).toBe(farm.state);
    expect(persisted?.totalArea.value).toBe(100);
    expect(persisted?.arableArea.value).toBe(60);
    expect(persisted?.vegetationArea.value).toBe(20);
  });
});
