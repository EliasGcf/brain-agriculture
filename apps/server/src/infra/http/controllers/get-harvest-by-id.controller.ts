import { Controller, Get, Param } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetHarvestByIdUseCase } from '@modules/farms/application/use-cases/get-harvest-by-id.use-case';
import { HarvestPresenter } from '../presenters/harvest.presenter';
import z from 'zod';
import { AUTH_COOKIE } from "@infra/auth/auth.constants";

@ApiCookieAuth(AUTH_COOKIE)
@ApiTags('Harvests')
@Controller('harvests/:id')
export class GetHarvestByIdController {
  constructor(private readonly useCase: GetHarvestByIdUseCase) {}

  @Get()
  @ApiOkResponse({ type: HarvestPresenter.Response })
  async handle(@Param('id', { schema: z.uuid() }) id: string) {
    const harvest = await this.useCase.execute({ id });
    return HarvestPresenter.toHTTP(harvest);
  }
}
