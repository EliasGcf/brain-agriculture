import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';

interface Params {
  id: string;
}

export class DeleteHarvestUseCase {
  constructor(private readonly harvestsRepository: HarvestsRepository) {}

  async execute(params: Params): Promise<void> {
    const harvest = await this.harvestsRepository.findById(params.id);
    if (!harvest) throw new ResourceNotFoundError('Harvest not found');

    await this.harvestsRepository.deleteById(params.id);
  }
}
