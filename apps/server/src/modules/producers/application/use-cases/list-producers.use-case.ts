import { PaginatedResult } from '@core/dto/paginated-result';
import { ListProducersDto } from '@modules/producers/application/dto/list-producers.dto';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { Injectable } from '@nestjs/common';

export interface Params {
  name?: string;
  document?: string;
  page: number;
  perPage: number;
}

@Injectable()
export class ListProducersUseCase {
  constructor(private readonly producersRepository: ProducersRepository) {}

  async execute(params: Params): Promise<PaginatedResult<ListProducersDto>> {
    const result = await this.producersRepository.findMany(params);
    return result;
  }
}
