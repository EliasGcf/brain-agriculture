import { Producer } from '@modules/producers/domain/entities/producer';
import { PaginatedResult } from '@core/dto/paginated-result';

export interface FindManyProducersParams {
  name?: string;
  document?: string;
  page: number;
  perPage: number;
}

export interface ProducerRepository {
  findById(id: string): Promise<Producer | null>;
  findByDocument(document: string): Promise<Producer | null>;
  findMany(params: FindManyProducersParams): Promise<PaginatedResult<Producer>>;
  save(producer: Producer): Promise<Producer>;
  deleteById(id: string): Promise<void>;
}
