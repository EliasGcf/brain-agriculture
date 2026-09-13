import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';
import { InMemoryPlantedCropRepository } from '@test/repositories/in-memory-planted-crop-repository';
import { DeletePlantedCropUseCase } from './delete-planted-crop.use-case';

describe('DeletePlantedCropUseCase', () => {
  let plantedCropRepository: InMemoryPlantedCropRepository;
  let useCase: DeletePlantedCropUseCase;

  beforeEach(() => {
    plantedCropRepository = new InMemoryPlantedCropRepository();
    useCase = new DeletePlantedCropUseCase(plantedCropRepository);
  });

  it('should be able to delete a planted crop', async () => {
    const crop = await plantedCropRepository.save(makePlantedCrop());

    await useCase.execute({ id: crop.id.toString() });

    await expect(plantedCropRepository.findById(crop.id.toString())).resolves.toBeNull();
  });

  it('should not be able to delete a missing planted crop', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
