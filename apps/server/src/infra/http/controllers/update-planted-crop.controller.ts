import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { UpdatePlantedCropUseCase } from '@modules/farms/application/use-cases/update-planted-crop.use-case';
import { PlantedCropPresenter } from '../presenters/planted-crop.presenter';
import { AUTH_COOKIE } from "@infra/auth/auth.constants";

const UpdatePlantedCropSchema = z.object({ name: z.string().min(1) });

@ApiCookieAuth(AUTH_COOKIE)
@ApiTags('Planted Crops')
@Controller('planted-crops/:id')
export class UpdatePlantedCropController {
  constructor(private readonly useCase: UpdatePlantedCropUseCase) {}

  @Patch()
  @ApiOkResponse({ type: PlantedCropPresenter.Response })
  async handle(
    @Param('id', { schema: z.uuid() }) id: string,
    @Body({ schema: UpdatePlantedCropSchema })
    body: z.infer<typeof UpdatePlantedCropSchema>,
  ) {
    const plantedCrop = await this.useCase.execute({ id, name: body.name });
    return PlantedCropPresenter.toHTTP(plantedCrop);
  }
}
