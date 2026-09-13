import { PaginatedResult } from '@core/dto/paginated-result';
import { Producer } from '@modules/producers/domain/entities/producer';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const schema = z.object({
  id: z.string(),
  name: z.string(),
  document: z.string(),
  createdAt: z.string(),
});

const PaginatedSchema = z.object({
  items: z.array(schema),
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
      document: producer.document.value,
      createdAt: producer.createdAt.toISOString(),
    });
  }

  static toPaginatedHTTP(producers: PaginatedResult<Producer>) {
    return PaginatedSchema.parse({
      items: producers.items.map(this.toHTTP),
      total: producers.total,
    });
  }
}
