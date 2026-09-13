import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { Farm } from '@modules/farms/domain/entities/farm';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { Injectable } from '@nestjs/common';

interface Params {
  id: string;
}

@Injectable()
export class GetFarmByIdUseCase {
  constructor(private readonly farmsRepository: FarmsRepository) {}

  async execute(params: Params): Promise<Farm> {
    const farm = await this.farmsRepository.findById(params.id);
    if (!farm) throw new ResourceNotFoundError('Farm not found');

    return farm;
  }
}
