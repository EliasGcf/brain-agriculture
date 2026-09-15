import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListFarmsByProducerUseCase } from '@modules/farms/application/use-cases/list-farms-by-producer.use-case';
import { FarmPresenter } from '../presenters/farm.presenter';
import z from 'zod';

@ApiTags('Farms')
@Controller('producers/:producerId/farms')
export class ListFarmsByProducerController {
  constructor(private readonly useCase: ListFarmsByProducerUseCase) {}

  @Get()
  @ApiOkResponse({ type: [FarmPresenter.Response] })
  async handle(@Param('producerId', { schema: z.uuid() }) producerId: string) {
    const farms = await this.useCase.execute({ producerId });
    return farms.map(FarmPresenter.toHTTP);
  }
}
