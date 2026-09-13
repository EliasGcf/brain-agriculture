import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';
import { HarvestRepository } from '@modules/farms/domain/repositories/harvest-repository';
import { PlantedCropRepository } from '@modules/farms/domain/repositories/planted-crop-repository';

interface Params {
  name: string;
  harvestId: string;
}

export class CreatePlantedCropUseCase {
  constructor(
    private readonly plantedCropRepository: PlantedCropRepository,
    private readonly harvestRepository: HarvestRepository,
  ) {}

  async execute(params: Params) {
    const harvest = await this.harvestRepository.findById(params.harvestId);
    if (!harvest) throw new ResourceNotFoundError('Harvest not found');

    const crop = PlantedCrop.create({ name: params.name, harvestId: params.harvestId });

    await this.plantedCropRepository.save(crop);

    return crop;
  }
}
