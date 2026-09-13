import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';

const schema = z.object({
  id: z.string(),
  name: z.string(),
  harvestId: z.string(),
  createdAt: z.string(),
});

export class PlantedCropResponse extends createZodDto(schema) {}

export class PlantedCropPresenter {
  static Response = PlantedCropResponse;

  static toHTTP(value: PlantedCrop) {
    return schema.parse({
      id: value.id.toString(),
      name: value.name,
      harvestId: value.harvestId,
      createdAt: value.createdAt.toISOString(),
    });
  }
}
