import { z } from 'zod';
import { EntityValidationError } from '../errors/common/entity-validation-error';
import { ValueObject } from './value-object';

const schema = z.object({ value: z.string() });

class TestValueObject extends ValueObject<typeof schema> {
  constructor(props: z.input<typeof schema>) {
    super(TestValueObject.parse(schema, props));
  }
}

describe('value object', () => {
  it('parses props with the value object schema', () => {
    expect(() => new TestValueObject({ value: 'test' })).not.toThrow();
  });

  it('throws a common error when props are invalid', () => {
    expect(
      () => new TestValueObject({ value: 1 } as unknown as z.input<typeof schema>),
    ).toThrow(EntityValidationError);
  });
});
