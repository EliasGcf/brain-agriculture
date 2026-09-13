import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import z from 'zod';
import { cnpj as cnpjTools } from 'cpf-cnpj-validator';
import { zodValidator } from 'cpf-cnpj-validator/zod';

import { CreateProducerUseCase } from '@modules/producers/application/use-cases/create-producer.use-case';
import { ProducerPresenter } from '@infra/http/presenters/producer.presenter';

const { cpf, cnpj } = zodValidator(z);

const CreateProducerSchema = z.object(
  {
    name: z.string().min(1),
    document: z
      .string()
      .transform((value) => cnpjTools.strip(value))
      .pipe(z.union([cpf(), cnpj()])),
  },
  { error: 'Invalid producer data' },
);

@ApiTags('Producers')
@Controller('/producers')
export class CreateProducerController {
  constructor(private createProducer: CreateProducerUseCase) {}

  @Post()
  @ApiCreatedResponse({ type: ProducerPresenter.Response })
  async handle(
    @Body({ schema: CreateProducerSchema }) body: z.infer<typeof CreateProducerSchema>,
  ) {
    const result = await this.createProducer.execute({
      name: body.name,
      document: body.document,
    });

    return ProducerPresenter.toHTTP(result);
  }
}
