import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ListPlantedCropsByHarvestUseCase } from '@modules/farms/application/use-cases/list-planted-crops-by-harvest.use-case';
import { PlantedCropPresenter } from '../presenters/planted-crop.presenter';
import z from 'zod';

@ApiTags('Planted Crops')
@Controller('harvests/:harvestId/planted-crops')
export class ListPlantedCropsByHarvestController {
  constructor(private readonly useCase: ListPlantedCropsByHarvestUseCase) {}

  @Get()
  @ApiOkResponse({ type: [PlantedCropPresenter.Response] })
  async handle(@Param('harvestId', { schema: z.uuid() }) harvestId: string) {
    const crops = await this.useCase.execute({ harvestId });
    return crops.map(PlantedCropPresenter.toHTTP);
  }
}
