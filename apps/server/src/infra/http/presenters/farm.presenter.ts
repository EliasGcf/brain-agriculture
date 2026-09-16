import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { Farm } from '@modules/farms/domain/entities/farm';
import { PaginatedResult } from '@core/dto/paginated-result';
import { ListFarmsDto } from '@modules/farms/application/dto/list-farms.dto';
import { ProducerSchema } from '@infra/http/presenters/producer.presenter';

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

const PaginatedSchema = z.object({
  items: z.array(schema.and(z.object({ owner: ProducerSchema }))),
  total: z.number(),
});

export class FarmResponse extends createZodDto(schema) {}

export class PaginatedFarmResponse extends createZodDto(PaginatedSchema) {}

export class FarmPresenter {
  static Response = FarmResponse;
  static PaginatedResponse = PaginatedFarmResponse;

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

  static toPaginatedHTTP(farmsDto: PaginatedResult<ListFarmsDto>) {
    return PaginatedSchema.parse({
      total: farmsDto.total,
      items: farmsDto.items.map(({ farm, owner }) => ({
        id: farm.id.toString(),
        name: farm.name,
        producerId: farm.producerId,
        city: farm.city,
        state: farm.state,
        totalArea: farm.totalArea.value,
        arableArea: farm.arableArea.value,
        vegetationArea: farm.vegetationArea.value,
        createdAt: farm.createdAt.toISOString(),
        owner: {
          id: owner.id.toString(),
          name: owner.name,
          document: {
            type: owner.document.type,
            value: owner.document.value,
            formatted: owner.document.formatted,
          },
          createdAt: owner.createdAt.toISOString(),
        },
      })),
    });
  }
}
