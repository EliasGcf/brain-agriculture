import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { PlantedCropRepository } from '@modules/farms/domain/repositories/planted-crop-repository';

interface Params {
  id: string;
}

export class DeletePlantedCropUseCase {
  constructor(private readonly plantedCropRepository: PlantedCropRepository) {}

  async execute(params: Params): Promise<void> {
    const plantedCrop = await this.plantedCropRepository.findById(params.id);
    if (!plantedCrop) throw new ResourceNotFoundError('Planted crop not found');

    await this.plantedCropRepository.deleteById(params.id);
  }
}
