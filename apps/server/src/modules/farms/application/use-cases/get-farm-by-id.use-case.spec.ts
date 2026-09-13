import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { makeFarm } from '@test/factories/make-farm.factory';
import { InMemoryFarmsRepository } from '@test/repositories/in-memory-farms.repository';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { GetFarmByIdUseCase } from './get-farm-by-id.use-case';

describe('GetFarmByIdUseCase', () => {
  let farmsRepository: InMemoryFarmsRepository;
  let useCase: GetFarmByIdUseCase;

  beforeEach(() => {
    farmsRepository = new InMemoryFarmsRepository(
      new InMemoryHarvestsRepository(new InMemoryPlantedCropsRepository()),
    );
    useCase = new GetFarmByIdUseCase(farmsRepository);
  });

  it('should be able to get a farm by id', async () => {
    const farm = await farmsRepository.save(makeFarm());
    await expect(useCase.execute({ id: farm.id.toString() })).resolves.toEqual(farm);
  });

  it('should not be able to get a missing farm', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
