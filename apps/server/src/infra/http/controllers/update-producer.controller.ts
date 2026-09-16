import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { UpdateProducerUseCase } from '@modules/producers/application/use-cases/update-producer.use-case';
import { ProducerPresenter } from '../presenters/producer.presenter';
import { AUTH_COOKIE } from "@infra/auth/auth.constants";

const UpdateProducerSchema = z.object({
  name: z.string().min(1).optional(),
  document: z.string().min(1).optional(),
});

@ApiCookieAuth(AUTH_COOKIE)
@ApiTags('Producers')
@Controller('producers/:id')
export class UpdateProducerController {
  constructor(private readonly useCase: UpdateProducerUseCase) {}

  @Patch()
  @ApiOkResponse({ type: ProducerPresenter.Response })
  async handle(
    @Param('id', { schema: z.uuid() }) id: string,
    @Body({ schema: UpdateProducerSchema }) body: z.infer<typeof UpdateProducerSchema>,
  ) {
    const producer = await this.useCase.execute({
      id,
      document: body.document,
      name: body.name,
    });

    return ProducerPresenter.toHTTP(producer);
  }
}
