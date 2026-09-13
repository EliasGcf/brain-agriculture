import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { Harvest } from '@modules/farms/domain/entities/harvest';
import { HarvestRepository } from '@modules/farms/domain/repositories/harvest-repository';

interface Params {
  id: string;
}

export class GetHarvestByIdUseCase {
  constructor(private readonly harvestRepository: HarvestRepository) {}

  async execute(params: Params): Promise<Harvest> {
    const harvest = await this.harvestRepository.findById(params.id);
    if (!harvest) throw new ResourceNotFoundError('Harvest not found');

    return harvest;
  }
}
