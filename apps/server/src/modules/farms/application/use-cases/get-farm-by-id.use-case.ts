import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { Farm } from '@modules/farms/domain/entities/farm';
import { FarmRepository } from '@modules/farms/domain/repositories/farm-repository';

interface Params {
  id: string;
}

export class GetFarmByIdUseCase {
  constructor(private readonly farmRepository: FarmRepository) {}

  async execute(params: Params): Promise<Farm> {
    const farm = await this.farmRepository.findById(params.id);
    if (!farm) throw new ResourceNotFoundError('Farm not found');

    return farm;
  }
}
