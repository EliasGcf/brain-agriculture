import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Farm } from '@modules/farms/domain/entities/farm';

const schema = z.object({
  id: z.string(),
  name: z.string(),
  producerId: z.string(),
  city: z.string(),
  state: z.string(),
  totalArea: z.number(),
  arableArea: z.number(),
  vegetationArea: z.number(),
  createdAt: z.string(),
});

export class FarmResponse extends createZodDto(schema) {}

export class FarmPresenter {
  static Response = FarmResponse;

  static toHTTP(farm: Farm) {
    return schema.parse({
      id: farm.id.toString(),
      name: farm.name,
      producerId: farm.producerId,
      city: farm.city,
      state: farm.state,
      totalArea: farm.totalArea.value,
      arableArea: farm.arableArea.value,
      vegetationArea: farm.vegetationArea.value,
      createdAt: farm.createdAt.toISOString(),
    });
  }
}
