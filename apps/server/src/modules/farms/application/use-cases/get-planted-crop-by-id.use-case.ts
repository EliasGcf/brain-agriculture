import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';
import { PlantedCropsRepository } from '@modules/farms/domain/repositories/planted-crops.repository';

interface Params {
  id: string;
}

export class GetPlantedCropByIdUseCase {
  constructor(private readonly plantedCropsRepository: PlantedCropsRepository) {}

  async execute(params: Params): Promise<PlantedCrop> {
    const crop = await this.plantedCropsRepository.findById(params.id);
    if (!crop) throw new ResourceNotFoundError('Planted crop not found');

    return crop;
  }
}
