import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';
import { InMemoryPlantedCropRepository } from '@test/repositories/in-memory-planted-crop-repository';
import { UpdatePlantedCropUseCase } from './update-planted-crop.use-case';
import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';

describe('UpdatePlantedCropUseCase', () => {
  let plantedCropRepository: InMemoryPlantedCropRepository;
  let useCase: UpdatePlantedCropUseCase;

  beforeEach(() => {
    plantedCropRepository = new InMemoryPlantedCropRepository();
    useCase = new UpdatePlantedCropUseCase(plantedCropRepository);
  });

  it('should be able to update a planted crop name and preserve its parent', async () => {
    const crop = await plantedCropRepository.save(makePlantedCrop());

    const result = await useCase.execute({ id: crop.id.toString(), name: 'Milho' });

    expect(result.name).toBe('Milho');
    expect(result.harvestId).toBe(crop.harvestId);
    expect(result.id).toBe(crop.id);
    expect(result.createdAt).toBe(crop.createdAt);

    await expect(plantedCropRepository.findById(crop.id.toString())).resolves.toEqual(
      result,
    );
  });

  it('should not be able to update a missing planted crop', async () => {
    await expect(
      useCase.execute({ id: 'missing', name: 'Milho' }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should be able to preserve a planted crop when the name is omitted', async () => {
    const crop = await plantedCropRepository.save(makePlantedCrop());
    const result = await useCase.execute({ id: crop.id.toString() });
    const persisted = await plantedCropRepository.findById(crop.id.toString());

    expect(result.name).toBe(crop.name);
    expect(result.id).toBe(crop.id);
    expect(result.harvestId).toBe(crop.harvestId);
    expect(result.createdAt).toBe(crop.createdAt);
    expect(persisted?.name).toBe(crop.name);
    expect(persisted?.harvestId).toBe(crop.harvestId);
    expect(persisted?.createdAt).toBe(crop.createdAt);
  });
});
