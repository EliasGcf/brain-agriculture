import { z } from 'zod';
import { Entity } from '@core/entities/entity';
import { UniqueEntityID } from '@core/entities/unique-entity-id';
import { Document } from '@modules/producers/domain/value-objects/document';

const schema = z.object({
  name: z.string().trim().min(1),
  document: z.custom<Document>((value) => value instanceof Document),
  createdAt: z.date().default(() => new Date()),
});

type Schema = typeof schema;
type Input = z.input<Schema>;

export class Producer extends Entity<Schema> {
  static create(props: Input, id?: UniqueEntityID) {
    return new Producer(Producer.parse(schema, props), id);
  }

  update(props: Partial<Pick<Input, 'name' | 'document'>>) {
    this.props = Producer.parse(schema, { ...this.props, ...props });
  }

  get name() {
    return this.props.name;
  }

  get document() {
    return this.props.document;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
