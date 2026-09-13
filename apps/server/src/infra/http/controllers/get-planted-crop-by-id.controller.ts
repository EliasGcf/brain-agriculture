import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetPlantedCropByIdUseCase } from '@modules/farms/application/use-cases/get-planted-crop-by-id.use-case';
import { PlantedCropPresenter } from '../presenters/planted-crop.presenter';
import z from 'zod';

@ApiTags('Planted Crops')
@Controller('planted-crops/:id')
export class GetPlantedCropByIdController {
  constructor(private readonly useCase: GetPlantedCropByIdUseCase) {}

  @Get()
  @ApiOkResponse({ type: PlantedCropPresenter.Response })
  async handle(@Param('id', { schema: z.uuid() }) id: string) {
    const plantedCrop = await this.useCase.execute({ id });
    return PlantedCropPresenter.toHTTP(plantedCrop);
  }
}
