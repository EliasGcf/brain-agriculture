import { faker } from '@faker-js/faker';
import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';
import { Injectable } from '@nestjs/common';
import { PlantedCropsRepository } from '@modules/farms/domain/repositories/planted-crops.repository';

type Overrides = {
  harvestId?: string;
};

export function makePlantedCrop(data: Overrides = {}) {
  return PlantedCrop.create({
    name: faker.commerce.productName(),
    harvestId: data.harvestId ?? faker.string.uuid(),
  });
}

@Injectable()
export class PlantedCropFactory {
  constructor(private plantedCropsRepository: PlantedCropsRepository) {}

  async make(data?: Overrides) {
    return this.plantedCropsRepository.save(makePlantedCrop(data));
  }
}
