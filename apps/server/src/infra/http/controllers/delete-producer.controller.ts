import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DeleteProducerUseCase } from '@modules/producers/application/use-cases/delete-producer.use-case';
import z from 'zod';

@ApiTags('Producers')
@Controller('producers/:id')
export class DeleteProducerController {
  constructor(private readonly useCase: DeleteProducerUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ description: 'Producer has farms' })
  @ApiNotFoundResponse({ description: 'Producer not found' })
  async handle(@Param('id', { schema: z.uuid() }) id: string) {
    await this.useCase.execute({ id });
  }
}
