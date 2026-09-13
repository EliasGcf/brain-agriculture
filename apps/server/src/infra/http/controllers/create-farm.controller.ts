import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';

import { CreateFarmUseCase } from '@modules/farms/application/use-cases/create-farm.use-case';
import { FarmPresenter } from '@infra/http/presenters/farm.presenter';

const FarmCreateSchema = z.object({
  name: z.string(),
  producerId: z.string(),
  city: z.string(),
  state: z.string(),
  totalArea: z.number(),
  arableArea: z.number(),
  vegetationArea: z.number(),
});

export type CreateFarmBody = z.infer<typeof FarmCreateSchema>;

@ApiTags('Farms')
@Controller('farms')
export class CreateFarmController {
  constructor(private readonly useCase: CreateFarmUseCase) {}

  @Post()
  @ApiCreatedResponse({ type: FarmPresenter.Response })
  async handle(@Body({ schema: FarmCreateSchema }) body: CreateFarmBody) {
    const farm = await this.useCase.execute(body);
    return FarmPresenter.toHTTP(farm);
  }
}
