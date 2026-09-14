import { Controller, Delete, HttpCode, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { DeletePlantedCropUseCase } from '@modules/farms/application/use-cases/delete-planted-crop.use-case';
import z from 'zod';

@ApiBearerAuth()
@ApiTags('Planted Crops')
@Controller('planted-crops/:id')
export class DeletePlantedCropController {
  constructor(private readonly useCase: DeletePlantedCropUseCase) {}

  @Delete()
  @HttpCode(204)
  @ApiNoContentResponse()
  async handle(@Param('id', { schema: z.uuid() }) id: string) {
    await this.useCase.execute({ id });
  }
}
