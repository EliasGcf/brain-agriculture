import { Injectable } from '@nestjs/common';
import { Harvest } from '@modules/farms/domain/entities/harvest';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';

interface Params {
  farmId: string;
}

@Injectable()
export class ListHarvestsByFarmUseCase {
  constructor(private readonly harvestsRepository: HarvestsRepository) {}

  async execute(params: Params): Promise<Harvest[]> {
    return this.harvestsRepository.findManyByFarmId(params.farmId);
  }
}
