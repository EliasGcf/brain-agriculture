import { makeHarvest } from '@test/factories/make-harvest.factory';
import { InMemoryHarvestRepository } from '@test/repositories/in-memory-harvest-repository';
import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { InMemoryPlantedCropRepository } from '@test/repositories/in-memory-planted-crop-repository';
import { UpdateHarvestUseCase } from './update-harvest.use-case';

describe('UpdateHarvestUseCase', () => {
  let harvestRepository: InMemoryHarvestRepository;
  let useCase: UpdateHarvestUseCase;

  beforeEach(() => {
    harvestRepository = new InMemoryHarvestRepository(
      new InMemoryPlantedCropRepository(),
    );
    useCase = new UpdateHarvestUseCase(harvestRepository);
  });

  it('should be able to update a harvest name and preserve its parent', async () => {
    const harvest = await harvestRepository.save(makeHarvest());

    const result = await useCase.execute({
      id: harvest.id.toString(),
      name: 'Safra atualizada',
    });

    expect(result.name).toBe('Safra atualizada');
    expect(result.farmId).toBe(harvest.farmId);
    expect(result.id).toBe(harvest.id);
    expect(result.createdAt).toBe(harvest.createdAt);

    await expect(harvestRepository.findById(harvest.id.toString())).resolves.toBe(result);
  });

  it('should not be able to update a missing harvest', async () => {
    await expect(
      useCase.execute({ id: 'missing', name: 'Safra atualizada' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should be able to preserve a harvest when the name is omitted', async () => {
    const harvest = await harvestRepository.save(makeHarvest());
    const result = await useCase.execute({ id: harvest.id.toString() });
    const persisted = await harvestRepository.findById(harvest.id.toString());

    expect(result.name).toBe(harvest.name);
    expect(result.id).toBe(harvest.id);
    expect(result.farmId).toBe(harvest.farmId);
    expect(result.createdAt).toBe(harvest.createdAt);
    expect(persisted?.name).toBe(harvest.name);
    expect(persisted?.farmId).toBe(harvest.farmId);
    expect(persisted?.createdAt).toBe(harvest.createdAt);
  });
});
