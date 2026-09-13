import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';
import { PlantedCropRepository } from '@modules/farms/domain/repositories/planted-crop-repository';

interface Params {
  id: string;
}

export class GetPlantedCropByIdUseCase {
  constructor(private readonly plantedCropRepository: PlantedCropRepository) {}

  async execute(params: Params): Promise<PlantedCrop> {
    const crop = await this.plantedCropRepository.findById(params.id);
    if (!crop) throw new ResourceNotFoundError('Planted crop not found');

    return crop;
  }
}
