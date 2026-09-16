import { Producer } from '@modules/producers/domain/entities/producer';
import { PaginatedResult } from '@core/dto/paginated-result';
import { ListProducersDto } from '@modules/producers/application/dto/list-producers.dto';

export interface FindManyProducersParams {
  search?: string;
  page: number;
  perPage: number;
}

export type FindManyProducersResult = PaginatedResult<ListProducersDto>;

export abstract class ProducersRepository {
  abstract count(): Promise<number>;
  abstract findById(id: string): Promise<Producer | null>;
  abstract findByDocument(document: string): Promise<Producer | null>;
  abstract findMany(params: FindManyProducersParams): Promise<FindManyProducersResult>;
  abstract save(producer: Producer): Promise<Producer>;
  abstract deleteById(id: string): Promise<void>;
}
