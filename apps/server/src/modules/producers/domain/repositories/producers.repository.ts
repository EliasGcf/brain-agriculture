import { Producer } from '@modules/producers/domain/entities/producer';
import { PaginatedResult } from '@core/dto/paginated-result';

export interface FindManyProducersParams {
  name?: string;
  document?: string;
  page: number;
  perPage: number;
}

export abstract class ProducersRepository {
  abstract findById(id: string): Promise<Producer | null>;
  abstract findByDocument(document: string): Promise<Producer | null>;
  abstract findMany(params: FindManyProducersParams): Promise<PaginatedResult<Producer>>;
  abstract save(producer: Producer): Promise<Producer>;
  abstract deleteById(id: string): Promise<void>;
}
