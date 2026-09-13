import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { Farm } from '@modules/farms/domain/entities/farm';
import { Area } from '@modules/farms/domain/value-objects/area';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { Injectable } from '@nestjs/common';

export type UpdateFarmParams = {
  id: string;
  name?: string;
  producerId?: string;
  city?: string;
  state?: string;
  totalArea?: number;
  arableArea?: number;
  vegetationArea?: number;
};

@Injectable()
export class UpdateFarmUseCase {
  constructor(
    private readonly farmsRepository: FarmsRepository,
    private readonly producersRepository: ProducersRepository,
  ) {}
  async execute(params: UpdateFarmParams): Promise<Farm> {
    const farm = await this.farmsRepository.findById(params.id);
    if (!farm) throw new ResourceNotFoundError('Farm not found');

    if (params.producerId !== undefined && params.producerId !== farm.producerId) {
      const producer = await this.producersRepository.findById(params.producerId);
      if (!producer) throw new ResourceNotFoundError('Producer not found');
    }

    const toUpdate: Parameters<typeof farm.update>[0] = {};

    if (params.name !== undefined) toUpdate.name = params.name;
    if (params.producerId !== undefined) toUpdate.producerId = params.producerId;
    if (params.city !== undefined) toUpdate.city = params.city;
    if (params.state !== undefined) toUpdate.state = params.state;

    if (params.totalArea !== undefined) {
      toUpdate.totalArea = Area.create(params.totalArea);
    }
    if (params.arableArea !== undefined) {
      toUpdate.arableArea = Area.create(params.arableArea);
    }
    if (params.vegetationArea !== undefined) {
      toUpdate.vegetationArea = Area.create(params.vegetationArea);
    }

    farm.update(toUpdate);

    await this.farmsRepository.save(farm);

    return farm;
  }
}
