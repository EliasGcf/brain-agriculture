import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListHarvestsByFarmUseCase } from '@modules/farms/application/use-cases/list-harvests-by-farm.use-case';
import { HarvestPresenter } from '../presenters/harvest.presenter';
import z from 'zod';

@ApiTags('Harvests')
@Controller('farms/:farmId/harvests')
export class ListHarvestsByFarmController {
  constructor(private readonly useCase: ListHarvestsByFarmUseCase) {}

  @Get()
  @ApiOkResponse({ type: [HarvestPresenter.Response] })
  async handle(@Param('farmId', { schema: z.uuid() }) farmId: string) {
    const harvests = await this.useCase.execute({ farmId });
    return harvests.map(HarvestPresenter.toHTTP);
  }
}
