import { Farm } from '@modules/farms/domain/entities/farm';
import { PaginatedResult } from '@core/dto/paginated-result';
import { ListFarmsDto } from "@modules/farms/application/dto/list-farms.dto";

export interface FindManyFarmsParams {
  name?: string;
  producerId?: string;
  city?: string;
  state?: string;
  page: number;
  perPage: number;
}
import type { FarmsDashboardMetricsDto } from '@modules/metrics/application/dto/dashboard-metrics.dto';

export abstract class FarmsRepository {
  abstract getDashboardMetrics(): Promise<FarmsDashboardMetricsDto>;
  abstract findById(id: string): Promise<Farm | null>;
  abstract findManyByProducerId(producerId: string): Promise<Farm[]>;
  abstract findMany(params: FindManyFarmsParams): Promise<PaginatedResult<ListFarmsDto>>;
  abstract save(farm: Farm): Promise<Farm>;
  abstract deleteById(id: string): Promise<void>;
}
