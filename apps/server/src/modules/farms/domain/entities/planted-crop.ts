import { z } from 'zod';
import { Entity } from '@core/entities/entity';
import { UniqueEntityID } from '@core/entities/unique-entity-id';

const schema = z.object({
  name: z.string().trim().min(1),
  harvestId: z.string().trim().min(1),
  createdAt: z.date().default(() => new Date()),
});

type Schema = typeof schema;
type Input = z.input<Schema>;

export class PlantedCrop extends Entity<Schema> {
  static create(props: Input, id?: UniqueEntityID) {
    return new PlantedCrop(PlantedCrop.parse(schema, props), id);
  }

  get name() {
    return this.props.name;
  }

  get harvestId() {
    return this.props.harvestId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  update(props: Partial<Pick<Input, 'name'>>) {
    this.props = PlantedCrop.parse(schema, { ...this.props, ...props });
  }
}
