import { z } from 'zod';
import { Entity } from '@core/entities/entity';
import { UniqueEntityID } from '@core/entities/unique-entity-id';

const schema = z.object({
  name: z.string().trim().min(1),
  harvestId: z.string().trim().min(1),
});

type Schema = typeof schema;

export class PlantedCrop extends Entity<Schema> {
  static create(props: z.input<Schema>, id?: UniqueEntityID) {
    return new PlantedCrop(PlantedCrop.parse(schema, props), id);
  }

  get name() {
    return this.props.name;
  }

  get harvestId() {
    return this.props.harvestId;
  }
}
