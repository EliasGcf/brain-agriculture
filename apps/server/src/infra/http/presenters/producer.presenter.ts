import { PaginatedResult } from '@core/dto/paginated-result';
import { ListProducersDto } from '@modules/producers/application/dto/list-producers.dto';
import { Producer } from '@modules/producers/domain/entities/producer';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const schema = z.object({
  id: z.string(),
  name: z.string(),
  document: z.object({
    type: z.enum(['cpf', 'cnpj']),
    value: z.string(),
    formatted: z.string(),
  }),
  createdAt: z.string(),
});

const PaginatedSchema = z.object({
  items: z.array(schema.and(z.object({ farmsCount: z.number() }))),
  total: z.number(),
});

class ProducerResponse extends createZodDto(schema) {}
class PaginatedProducerResponse extends createZodDto(PaginatedSchema) {}

export class ProducerPresenter {
  static Response = ProducerResponse;
  static PaginatedResponse = PaginatedProducerResponse;

  static toHTTP(producer: Producer) {
    return schema.parse({
      id: producer.id.toString(),
      name: producer.name,
      document: {
        type: producer.document.type,
        value: producer.document.value,
        formatted: producer.document.formatted,
      },
      createdAt: producer.createdAt.toISOString(),
    });
  }

  static toPaginatedHTTP(producers: PaginatedResult<ListProducersDto>) {
    return PaginatedSchema.parse({
      total: producers.total,
      items: producers.items.map(({ producer, farmsCount }) => ({
        id: producer.id.toString(),
        name: producer.name,
        document: {
          type: producer.document.type,
          value: producer.document.value,
          formatted: producer.document.formatted,
        },
        createdAt: producer.createdAt.toISOString(),
        farmsCount,
      })),
    });
  }
}
