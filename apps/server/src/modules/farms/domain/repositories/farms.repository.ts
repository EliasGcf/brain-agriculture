import { Farm } from '@modules/farms/domain/entities/farm';
import type { FarmsDashboardMetricsDto } from '@modules/metrics/application/dto/dashboard-metrics.dto';

export abstract class FarmsRepository {
  abstract getDashboardMetrics(): Promise<FarmsDashboardMetricsDto>;
  abstract findById(id: string): Promise<Farm | null>;
  abstract findManyByProducerId(producerId: string): Promise<Farm[]>;
  abstract save(farm: Farm): Promise<Farm>;
  abstract deleteById(id: string): Promise<void>;
}
