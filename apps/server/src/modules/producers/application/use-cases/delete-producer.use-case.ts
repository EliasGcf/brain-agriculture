import { Injectable } from '@nestjs/common';
import { NotAllowedError } from '@core/errors/common/not-allowed.error';
import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';

interface Params {
  id: string;
}

@Injectable()
export class DeleteProducerUseCase {
  constructor(
    private readonly producersRepository: ProducersRepository,
    private readonly farmsRepository: FarmsRepository,
  ) {}

  async execute(params: Params): Promise<void> {
    const producer = await this.producersRepository.findById(params.id);
    if (!producer) throw new ResourceNotFoundError('Producer not found');

    const farms = await this.farmsRepository.findManyByProducerId(params.id);
    if (farms.length > 0) throw new NotAllowedError();

    await this.producersRepository.deleteById(params.id);
  }
}
