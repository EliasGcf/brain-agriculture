import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetFarmByIdUseCase } from '@modules/farms/application/use-cases/get-farm-by-id.use-case';
import { FarmPresenter } from '../presenters/farm.presenter';
import z from 'zod';

@ApiBearerAuth()
@ApiTags('Farms')
@Controller('farms/:id')
export class GetFarmByIdController {
  constructor(private readonly useCase: GetFarmByIdUseCase) {}

  @Get()
  @ApiOkResponse({ type: FarmPresenter.Response })
  async handle(@Param('id', { schema: z.uuid() }) id: string) {
    const farm = await this.useCase.execute({ id });
    return FarmPresenter.toHTTP(farm);
  }
}
