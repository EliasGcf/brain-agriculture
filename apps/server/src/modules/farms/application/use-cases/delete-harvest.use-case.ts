import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { HarvestRepository } from '@modules/farms/domain/repositories/harvest-repository';

interface Params {
  id: string;
}

export class DeleteHarvestUseCase {
  constructor(private readonly harvestRepository: HarvestRepository) {}

  async execute(params: Params): Promise<void> {
    const harvest = await this.harvestRepository.findById(params.id);
    if (!harvest) throw new ResourceNotFoundError('Harvest not found');

    await this.harvestRepository.deleteById(params.id);
  }
}
