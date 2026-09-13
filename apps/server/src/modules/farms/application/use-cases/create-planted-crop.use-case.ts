import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';
import { PlantedCropsRepository } from '@modules/farms/domain/repositories/planted-crops.repository';

interface Params {
  name: string;
  harvestId: string;
}

export class CreatePlantedCropUseCase {
  constructor(
    private readonly plantedCropsRepository: PlantedCropsRepository,
    private readonly harvestsRepository: HarvestsRepository,
  ) {}

  async execute(params: Params) {
    const harvest = await this.harvestsRepository.findById(params.harvestId);
    if (!harvest) throw new ResourceNotFoundError('Harvest not found');

    const crop = PlantedCrop.create({ name: params.name, harvestId: params.harvestId });

    await this.plantedCropsRepository.save(crop);

    return crop;
  }
}
