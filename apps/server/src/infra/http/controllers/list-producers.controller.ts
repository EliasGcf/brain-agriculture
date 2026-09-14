import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListProducersUseCase } from '@modules/producers/application/use-cases/list-producers.use-case';
import { ProducerPresenter } from '../presenters/producer.presenter';
import z from 'zod';

const QuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  perPage: z.coerce.number().optional().default(10),
});

@ApiBearerAuth()
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
