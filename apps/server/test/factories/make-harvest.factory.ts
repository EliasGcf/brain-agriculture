import { faker } from '@faker-js/faker';
import { Harvest } from '@modules/farms/domain/entities/harvest';
import { Injectable } from '@nestjs/common';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';

type Overrides = {
  farmId?: string;
};

export function makeHarvest(data: Overrides = {}) {
  return Harvest.create({
    name: faker.commerce.productName(),
    farmId: data.farmId ?? faker.string.uuid(),
  });
}

@Injectable()
export class HarvestFactory {
  constructor(private harvestsRepository: HarvestsRepository) {}

  async make(data?: Overrides) {
    return this.harvestsRepository.save(makeHarvest(data));
  }
}
