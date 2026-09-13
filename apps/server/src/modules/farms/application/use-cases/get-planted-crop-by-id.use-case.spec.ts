import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';
import { InMemoryPlantedCropRepository } from '@test/repositories/in-memory-planted-crop-repository';
import { GetPlantedCropByIdUseCase } from './get-planted-crop-by-id.use-case';

describe('GetPlantedCropByIdUseCase', () => {
  let plantedCropRepository: InMemoryPlantedCropRepository;
  let useCase: GetPlantedCropByIdUseCase;

  beforeEach(() => {
    plantedCropRepository = new InMemoryPlantedCropRepository();
    useCase = new GetPlantedCropByIdUseCase(plantedCropRepository);
  });

  it('should be able to get a planted crop by id', async () => {
    const crop = await plantedCropRepository.save(makePlantedCrop());
    await expect(useCase.execute({ id: crop.id.toString() })).resolves.toEqual(crop);
  });

  it('should not be able to get a missing planted crop', async () => {
    await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(
      ResourceNotFoundError,
    );
  });
});
