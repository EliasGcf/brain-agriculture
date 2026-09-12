import { z } from 'zod'
import { Entity } from '@core/entities/entity'
import { UniqueEntityID } from '@core/entities/unique-entity-id'
import { Document } from '@modules/producers/domain/value-objects/document'

const schema = z.object({
  name: z.string().trim().min(1),
  document: z.custom<Document>((value) => value instanceof Document),
})

type Schema = typeof schema

export class Producer extends Entity<Schema> {
  static create(props: z.input<Schema>, id?: UniqueEntityID) {
    return new Producer(Producer.parse(schema, props), id)
  }

  get name(): string {
    return this.props.name
  }

  get document(): Document {
    return this.props.document
  }
}
