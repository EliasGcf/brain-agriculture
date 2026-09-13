import { faker } from '@faker-js/faker';
import { Harvest } from '@modules/farms/domain/entities/harvest';

type Overrides = {
  farmId?: string;
};

export function makeHarvest(data: Overrides = {}) {
  return Harvest.create({
    name: faker.commerce.productName(),
    farmId: data.farmId ?? faker.string.uuid(),
  });
}
