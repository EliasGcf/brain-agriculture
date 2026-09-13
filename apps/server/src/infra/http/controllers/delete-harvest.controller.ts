import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { DeleteHarvestUseCase } from '@modules/farms/application/use-cases/delete-harvest.use-case';
import z from 'zod';

@ApiTags('Harvests')
@Controller('harvests/:id')
export class DeleteHarvestController {
  constructor(private readonly useCase: DeleteHarvestUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiNoContentResponse()
  async handle(@Param('id', { schema: z.uuid() }) id: string) {
    await this.useCase.execute({ id });
  }
}
