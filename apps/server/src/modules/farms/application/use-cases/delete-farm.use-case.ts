import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { FarmRepository } from '@modules/farms/domain/repositories/farm-repository';

interface Params {
  id: string;
}

export class DeleteFarmUseCase {
  constructor(private readonly farmRepository: FarmRepository) {}

  async execute(params: Params): Promise<void> {
    const farm = await this.farmRepository.findById(params.id);
    if (!farm) throw new ResourceNotFoundError('Farm not found');

    await this.farmRepository.deleteById(params.id);
  }
}
