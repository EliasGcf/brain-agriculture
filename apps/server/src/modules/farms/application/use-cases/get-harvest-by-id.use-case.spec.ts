import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makeHarvest } from '@test/factories/make-harvest.factory';
import { InMemoryHarvestRepository } from '@test/repositories/in-memory-harvest-repository';
import { InMemoryPlantedCropRepository } from '@test/repositories/in-memory-planted-crop-repository';
import { GetHarvestByIdUseCase } from './get-harvest-by-id.use-case';

describe('GetHarvestByIdUseCase', () => {
  let harvestRepository: InMemoryHarvestRepository;
  let useCase: GetHarvestByIdUseCase;

  beforeEach(() => {
    harvestRepository = new InMemoryHarvestRepository(
      new InMemoryPlantedCropRepository(),
    );
    useCase = new GetHarvestByIdUseCase(harvestRepository);
  });

  it('should be able to get a harvest by id', async () => {
    const harvest = await harvestRepository.save(makeHarvest());
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
