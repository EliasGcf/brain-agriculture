import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListProducersUseCase } from '@modules/producers/application/use-cases/list-producers.use-case';
import { ProducerPresenter } from '../presenters/producer.presenter';
import z from 'zod';
import { Document } from '@modules/producers/domain/value-objects/document';

const QuerySchema = z.object({
  name: z.string().optional(),
  document: z
    .string()
    .optional()
    .transform((value) => (value ? Document.strip(value) : undefined)),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
});

@ApiTags('Producers')
@Controller('producers')
export class ListProducersController {
  constructor(private readonly useCase: ListProducersUseCase) {}

  @Get()
  @ApiOkResponse({ type: ProducerPresenter.PaginatedResponse })
  async handle(@Query({ schema: QuerySchema }) query: z.infer<typeof QuerySchema>) {
    const producers = await this.useCase.execute(query);
    return ProducerPresenter.toPaginatedHTTP(producers);
  }
}
