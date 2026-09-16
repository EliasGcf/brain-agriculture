import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { UpdateHarvestUseCase } from '@modules/farms/application/use-cases/update-harvest.use-case';
import { HarvestPresenter } from '../presenters/harvest.presenter';
import { AUTH_COOKIE } from "@infra/auth/auth.constants";

const UpdateHarvestSchema = z.object({ name: z.string().min(1) });

@ApiCookieAuth(AUTH_COOKIE)
@ApiTags('Harvests')
@Controller('harvests/:id')
export class UpdateHarvestController {
  constructor(private readonly useCase: UpdateHarvestUseCase) {}

  @Patch()
  @ApiOkResponse({ type: HarvestPresenter.Response })
  async handle(
    @Param('id', { schema: z.uuid() }) id: string,
    @Body({ schema: UpdateHarvestSchema }) body: z.infer<typeof UpdateHarvestSchema>,
  ) {
    const harvest = await this.useCase.execute({ id, name: body.name });
    return HarvestPresenter.toHTTP(harvest);
  }
}
