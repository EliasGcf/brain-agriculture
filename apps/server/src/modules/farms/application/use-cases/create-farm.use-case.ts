import { ProducerRepository } from '@modules/producers/domain/repositories/producer-repository';
import { Farm } from '@modules/farms/domain/entities/farm';
import { Area } from '@modules/farms/domain/value-objects/area';
import { FarmRepository } from '@modules/farms/domain/repositories/farm-repository';
import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';

interface Params {
  name: string;
  producerId: string;
  city: string;
  state: string;
  totalArea: number;
  arableArea: number;
  vegetationArea: number;
}

export class CreateFarmUseCase {
  constructor(
    private readonly farmRepository: FarmRepository,
    private readonly producerRepository: ProducerRepository,
  ) {}

  async execute(params: Params) {
    const producer = await this.producerRepository.findById(params.producerId);
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

    await this.farmRepository.save(farm);

    return farm;
  }
}
