import { Body, Controller, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { CreateHarvestUseCase } from '@modules/farms/application/use-cases/create-harvest.use-case';
import { HarvestPresenter } from '../presenters/harvest.presenter';
import { AUTH_COOKIE } from "@infra/auth/auth.constants";

const CreateHarvestSchema = z.object({
  name: z.string().min(1),
  farmId: z.string().min(1),
});

@ApiCookieAuth(AUTH_COOKIE)
@ApiTags('Harvests')
@Controller('harvests')
export class CreateHarvestController {
  constructor(private readonly useCase: CreateHarvestUseCase) {}

  @Post()
  @ApiCreatedResponse({ type: HarvestPresenter.Response })
  async handle(
    @Body({ schema: CreateHarvestSchema }) body: z.infer<typeof CreateHarvestSchema>,
  ) {
    const harvest = await this.useCase.execute(body);
    return HarvestPresenter.toHTTP(harvest);
  }
}
