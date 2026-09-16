import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ListFarmsUseCase } from '@modules/farms/application/use-cases/list-farms.use-case';
import { FarmPresenter } from '@infra/http/presenters/farm.presenter';

const QuerySchema = z.object({
  name: z.string().optional(),
  producerId: z.uuid().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(100).optional().default(10),
});

@ApiTags('Farms')
@Controller('farms')
export class ListFarmsController {
  constructor(private readonly useCase: ListFarmsUseCase) {}

  @Get()
  @ApiOkResponse({ type: FarmPresenter.PaginatedResponse })
  async handle(@Query({ schema: QuerySchema }) query: z.infer<typeof QuerySchema>) {
    const farms = await this.useCase.execute(query);
    return FarmPresenter.toPaginatedHTTP(farms);
  }
}
