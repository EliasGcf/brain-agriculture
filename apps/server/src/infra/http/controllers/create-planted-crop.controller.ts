import { Body, Controller, Post } from '@nestjs/common';
import { ApiCookieAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { CreatePlantedCropUseCase } from '@modules/farms/application/use-cases/create-planted-crop.use-case';
import { PlantedCropPresenter } from '../presenters/planted-crop.presenter';
import { AUTH_COOKIE } from "@infra/auth/auth.constants";

const CreatePlantedCropSchema = z.object({
  name: z.string().min(1),
  harvestId: z.string().min(1),
});

@ApiCookieAuth(AUTH_COOKIE)
@ApiTags('Planted Crops')
@Controller('planted-crops')
export class CreatePlantedCropController {
  constructor(private readonly useCase: CreatePlantedCropUseCase) {}

  @Post()
  @ApiCreatedResponse({ type: PlantedCropPresenter.Response })
  async handle(
    @Body({ schema: CreatePlantedCropSchema })
    body: z.infer<typeof CreatePlantedCropSchema>,
  ) {
    const plantedCrop = await this.useCase.execute(body);
    return PlantedCropPresenter.toHTTP(plantedCrop);
  }
}
