import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { Farm } from '@modules/farms/domain/entities/farm';
import { Area } from '@modules/farms/domain/value-objects/area';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { Injectable } from '@nestjs/common';

interface Params {
  name: string;
  producerId: string;
  city: string;
  state: string;
  totalArea: number;
  arableArea: number;
  vegetationArea: number;
}

@Injectable()
export class CreateFarmUseCase {
  constructor(
    private readonly farmsRepository: FarmsRepository,
    private readonly producersRepository: ProducersRepository,
  ) {}

  async execute(params: Params) {
    const producer = await this.producersRepository.findById(params.producerId);
    if (!producer) throw new ResourceNotFoundError('Producer not found');

    const farm = Farm.create({
      city: params.city,
      name: params.name,
      producerId: params.producerId,
      state: params.state,
      totalArea: Area.create(params.totalArea),
      arableArea: Area.create(params.arableArea),
      vegetationArea: Area.create(params.vegetationArea),
    });

    await this.farmsRepository.save(farm);

    return farm;
  }
}
