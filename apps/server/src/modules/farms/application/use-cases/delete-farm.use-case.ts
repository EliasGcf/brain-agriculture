import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { Injectable } from '@nestjs/common';

interface Params {
  id: string;
}

@Injectable()
export class DeleteFarmUseCase {
  constructor(private readonly farmsRepository: FarmsRepository) {}

  async execute(params: Params): Promise<void> {
    const farm = await this.farmsRepository.findById(params.id);
    if (!farm) throw new ResourceNotFoundError('Farm not found');

    await this.farmsRepository.deleteById(params.id);
  }
}
