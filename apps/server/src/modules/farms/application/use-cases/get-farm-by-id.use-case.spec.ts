import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makeFarm } from '@test/factories/make-farm.factory';
import { InMemoryFarmRepository } from '@test/repositories/in-memory-farm-repository';
import { InMemoryHarvestRepository } from '@test/repositories/in-memory-harvest-repository';
import { InMemoryPlantedCropRepository } from '@test/repositories/in-memory-planted-crop-repository';
import { GetFarmByIdUseCase } from './get-farm-by-id.use-case';

describe('GetFarmByIdUseCase', () => {
  let farmRepository: InMemoryFarmRepository;
  let useCase: GetFarmByIdUseCase;

  beforeEach(() => {
    farmRepository = new InMemoryFarmRepository(
      new InMemoryHarvestRepository(new InMemoryPlantedCropRepository()),
    );
    useCase = new GetFarmByIdUseCase(farmRepository);
  });

  it('should be able to get a farm by id', async () => {
    const farm = await farmRepository.save(makeFarm());
    await expect(useCase.execute({ id: farm.id.toString() })).resolves.toEqual(farm);
  });

  it('should not be able to get a missing farm', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
