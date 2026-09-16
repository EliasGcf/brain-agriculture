import { Controller, Get, Param } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetProducerByIdUseCase } from '@modules/producers/application/use-cases/get-producer-by-id.use-case';
import { ProducerPresenter } from '../presenters/producer.presenter';
import z from 'zod';
import { AUTH_COOKIE } from "@infra/auth/auth.constants";

@ApiCookieAuth(AUTH_COOKIE)
@ApiTags('Producers')
@Controller('producers/:id')
export class GetProducerByIdController {
  constructor(private readonly useCase: GetProducerByIdUseCase) {}

  @Get()
  @ApiOkResponse({ type: ProducerPresenter.Response })
  async handle(@Param('id', { schema: z.uuid() }) id: string) {
    const producer = await this.useCase.execute({ id });
    return ProducerPresenter.toHTTP(producer);
  }
}
