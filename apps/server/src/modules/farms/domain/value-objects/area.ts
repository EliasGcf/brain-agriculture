import { z } from 'zod';
import { ValueObject } from '@core/entities/value-object';

const schema = z
  .number()
  .nonnegative()
  .refine((value) => Number.isInteger(value * 100));

export class Area extends ValueObject<typeof schema> {
  private constructor(value: number) {
    super(value);
  }

  static create(value: number) {
    return new Area(Area.parse(schema, value));
  }

  get value() {
    return this.props;
  }
}
