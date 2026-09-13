import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';
import { InMemoryPlantedCropsRepository } from '@test/repositories/in-memory-planted-crops.repository';
import { DeletePlantedCropUseCase } from './delete-planted-crop.use-case';

describe('DeletePlantedCropUseCase', () => {
  let plantedCropsRepository: InMemoryPlantedCropsRepository;
  let useCase: DeletePlantedCropUseCase;

  beforeEach(() => {
    plantedCropsRepository = new InMemoryPlantedCropsRepository();
    useCase = new DeletePlantedCropUseCase(plantedCropsRepository);
  });

  it('should be able to delete a planted crop', async () => {
    const crop = await plantedCropsRepository.save(makePlantedCrop());

    await useCase.execute({ id: crop.id.toString() });

    await expect(plantedCropsRepository.findById(crop.id.toString())).resolves.toBeNull();
  });

  it('should not be able to delete a missing planted crop', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
