import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { Producer } from '@modules/producers/domain/entities/producer';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';

export interface Params {
  id: string;
}

export class GetProducerByIdUseCase {
  constructor(private readonly repository: ProducersRepository) {}

  async execute(params: Params): Promise<Producer> {
    const producer = await this.repository.findById(params.id);
    if (!producer) throw new ResourceNotFoundError('Producer not found');
    return producer;
  }
}
