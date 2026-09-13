import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { PlantedCropsRepository } from '@modules/farms/domain/repositories/planted-crops.repository';

interface Params {
  id: string;
}

export class DeletePlantedCropUseCase {
  constructor(private readonly plantedCropsRepository: PlantedCropsRepository) {}

  async execute(params: Params): Promise<void> {
    const plantedCrop = await this.plantedCropsRepository.findById(params.id);
    if (!plantedCrop) throw new ResourceNotFoundError('Planted crop not found');

    await this.plantedCropsRepository.deleteById(params.id);
  }
}
