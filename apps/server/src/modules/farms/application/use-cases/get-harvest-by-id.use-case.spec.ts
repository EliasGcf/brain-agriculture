import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { makeHarvest } from '@test/factories/make-harvest.factory';
import { InMemoryHarvestsRepository } from '@test/repositories/in-memory-harvests.repository';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { GetHarvestByIdUseCase } from './get-harvest-by-id.use-case';

describe('GetHarvestByIdUseCase', () => {
  let harvestsRepository: InMemoryHarvestsRepository;
  let useCase: GetHarvestByIdUseCase;

  beforeEach(() => {
    harvestsRepository = new InMemoryHarvestsRepository(
      new InMemoryPlantedCropsRepository(),
    );
    useCase = new GetHarvestByIdUseCase(harvestsRepository);
  });

  it('should be able to get a harvest by id', async () => {
    const harvest = await harvestsRepository.save(makeHarvest());
    await expect(useCase.execute({ id: harvest.id.toString() })).resolves.toEqual(
      harvest,
    );
  });

  it('should not be able to get a missing harvest', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
