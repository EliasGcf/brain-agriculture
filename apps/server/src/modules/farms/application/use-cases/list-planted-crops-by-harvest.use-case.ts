import { Injectable } from '@nestjs/common';
import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';
import { PlantedCropsRepository } from '@modules/farms/domain/repositories/planted-crops.repository';

interface Params {
  harvestId: string;
}

@Injectable()
export class ListPlantedCropsByHarvestUseCase {
  constructor(private readonly plantedCropsRepository: PlantedCropsRepository) {}

  async execute(params: Params): Promise<PlantedCrop[]> {
    return this.plantedCropsRepository.findManyByHarvestId(params.harvestId);
  }
}
