import { z } from 'zod';
import { Entity } from '@core/entities/entity';
import { UniqueEntityID } from '@core/entities/unique-entity-id';

const schema = z.object({
  name: z.string().trim().min(1),
  farmId: z.string().trim().min(1),
  createdAt: z.date().default(() => new Date()),
});

type Schema = typeof schema;
type Input = z.input<Schema>;

export class Harvest extends Entity<Schema> {
  static create(props: Input, id?: UniqueEntityID) {
    return new Harvest(Harvest.parse(schema, props), id);
  }

  update(props: Partial<Pick<Input, 'name'>>) {
    this.props = Harvest.parse(schema, { ...this.props, ...props });
  }

  get name() {
    return this.props.name;
  }

  get farmId() {
    return this.props.farmId;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
