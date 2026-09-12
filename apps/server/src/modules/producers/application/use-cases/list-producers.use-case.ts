import { PaginatedResult } from '@core/dto/paginated-result';
import { Producer } from '@modules/producers/domain/entities/producer';
import { ProducerRepository } from '@modules/producers/domain/repositories/producer-repository';

export interface Params {
  name?: string;
  document?: string;
  page: number;
  perPage: number;
}

export class ListProducersUseCase {
  constructor(private readonly repository: ProducerRepository) {}

  async execute(params: Params): Promise<PaginatedResult<Producer>> {
    const result = await this.repository.findMany(params);
    return result;
  }
}
