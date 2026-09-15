import { Injectable } from '@nestjs/common';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { DashboardMetricsDto } from '../dto/dashboard-metrics.dto';

@Injectable()
export class GetDashboardMetricsUseCase {
  constructor(
    private readonly producersRepository: ProducersRepository,
    private readonly farmsRepository: FarmsRepository,
  ) {}

  async execute(): Promise<DashboardMetricsDto> {
    const [producerCount, farmMetrics] = await Promise.all([
      this.producersRepository.count(),
      this.farmsRepository.getDashboardMetrics(),
    ]);

    return { producerCount, ...farmMetrics };
  }
}
