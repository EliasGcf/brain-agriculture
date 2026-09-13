import { UniqueEntityID } from '@core/entities/unique-entity-id';

import { Producer } from '@modules/producers/domain/entities/producer';
import { Document } from '@modules/producers/domain/value-objects/document';

import { schema } from '@infra/database/drizzle/schema';

type RawProducer = typeof schema.producers.$inferSelect;
type RawInsertProducer = typeof schema.producers.$inferInsert;

export class DrizzleProducerMapper {
  static toDomain(raw: RawProducer): Producer {
    return Producer.create(
      {
        document: Document.create(raw.document),
        name: raw.name,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toRaw(producer: Producer): RawInsertProducer {
    return {
      id: producer.id.toValue(),
      document: producer.document.value,
      name: producer.name,
      createdAt: producer.createdAt,
    };
  }
}
