import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { Harvest } from '@modules/farms/domain/entities/harvest';

const schema = z.object({
  id: z.string(),
  name: z.string(),
  farmId: z.string(),
  createdAt: z.string(),
});

export class HarvestResponse extends createZodDto(schema) {}

export class HarvestPresenter {
  static Response = HarvestResponse;

  static toHTTP(value: Harvest) {
    return schema.parse({
      id: value.id.toString(),
      name: value.name,
      farmId: value.farmId,
      createdAt: value.createdAt.toISOString(),
    });
  }
}
