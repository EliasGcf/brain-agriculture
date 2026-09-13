import { faker } from '@faker-js/faker';
import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';

type Overrides = {
  harvestId?: string;
};

export function makePlantedCrop(data: Overrides = {}) {
  return PlantedCrop.create({
    name: faker.commerce.productName(),
    harvestId: data.harvestId ?? faker.string.uuid(),
  });
}
