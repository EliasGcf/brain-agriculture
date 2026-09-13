import { z } from 'zod';
import { Entity } from '@core/entities/entity';
import { UniqueEntityID } from '@core/entities/unique-entity-id';
import { Area } from '@modules/farms/domain/value-objects/area';

const schema = z
  .object({
    name: z.string().trim().min(1),
    producerId: z.string().trim().min(1),
    city: z.string().trim().min(1),
    state: z.string().trim().min(1),
    totalArea: z
      .custom<Area>((value) => value instanceof Area)
      .refine((area) => area.value > 0, { message: 'Total area must be positive' }),
    arableArea: z.custom<Area>((value) => value instanceof Area),
    vegetationArea: z.custom<Area>((value) => value instanceof Area),
    createdAt: z.date().default(() => new Date()),
  })
  .superRefine((props, ctx) => {
    if (props.arableArea.value + props.vegetationArea.value > props.totalArea.value) {
      ctx.addIssue({
        code: 'custom',
        message: 'Allocated areas cannot exceed total area',
        path: ['arableArea'],
      });
    }
  });

type Schema = typeof schema;
type Input = z.input<Schema>;

export class Farm extends Entity<Schema> {
  static create(props: Input, id?: UniqueEntityID) {
    return new Farm(Farm.parse(schema, props), id);
  }

  update(props: Partial<Input>) {
    this.props = Farm.parse(schema, { ...this.props, ...props });
  }

  get name() {
    return this.props.name;
  }

  get producerId() {
    return this.props.producerId;
  }

  get city() {
    return this.props.city;
  }

  get state() {
    return this.props.state;
  }

  get totalArea() {
    return this.props.totalArea;
  }

  get arableArea() {
    return this.props.arableArea;
  }

  get vegetationArea() {
    return this.props.vegetationArea;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
