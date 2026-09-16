import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { UpdateFarmUseCase } from '@modules/farms/application/use-cases/update-farm.use-case';
import { FarmPresenter } from '../presenters/farm.presenter';
import { AUTH_COOKIE } from "@infra/auth/auth.constants";

const UpdateFarmSchema = z.object({
  name: z.string().optional(),
  producerId: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  totalArea: z.number().optional(),
  arableArea: z.number().optional(),
  vegetationArea: z.number().optional(),
});

@ApiCookieAuth(AUTH_COOKIE)
@ApiTags('Farms')
@Controller('farms/:id')
export class UpdateFarmController {
  constructor(private readonly useCase: UpdateFarmUseCase) {}

  @Patch()
  @ApiOkResponse({ type: FarmPresenter.Response })
  async handle(
    @Param('id', { schema: z.uuid() }) id: string,
    @Body({ schema: UpdateFarmSchema }) body: z.infer<typeof UpdateFarmSchema>,
  ) {
    const farm = await this.useCase.execute({
      id,
      arableArea: body.arableArea,
      city: body.city,
      name: body.name,
      producerId: body.producerId,
      state: body.state,
      totalArea: body.totalArea,
      vegetationArea: body.vegetationArea,
    });

    return FarmPresenter.toHTTP(farm);
  }
}
