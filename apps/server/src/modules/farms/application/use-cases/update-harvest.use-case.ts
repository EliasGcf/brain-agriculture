import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { Harvest } from '@modules/farms/domain/entities/harvest';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';
import { Injectable } from '@nestjs/common';

interface Params {
  id: string;
  name?: string;
}

@Injectable()
export class UpdateHarvestUseCase {
  constructor(private readonly harvestsRepository: HarvestsRepository) {}

  async execute(params: Params): Promise<Harvest> {
    const harvest = await this.harvestsRepository.findById(params.id);
    if (!harvest) throw new ResourceNotFoundError('Harvest not found');

    if (params.name !== undefined) {
      harvest.update({ name: params.name });
    }

    await this.harvestsRepository.save(harvest);

    return harvest;
  }
}
