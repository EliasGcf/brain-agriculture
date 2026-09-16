import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetDashboardMetricsUseCase } from '@modules/metrics/application/use-cases/get-dashboard-metrics.use-case';
import { DashboardMetricsPresenter } from '../presenters/dashboard-metrics.presenter';

@ApiTags('Metrics')
@Controller('metrics')
export class GetDashboardMetricsController {
  constructor(private readonly useCase: GetDashboardMetricsUseCase) {}

  @Get()
  @ApiOkResponse({ type: DashboardMetricsPresenter.Response })
  async handle() {
    return DashboardMetricsPresenter.toHTTP(await this.useCase.execute());
  }
}
