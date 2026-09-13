import { z } from 'zod';
import { EntityValidationError } from '../errors/common/entity-validation.error';
import { ValueObject } from './value-object';

const schema = z.object({ value: z.string().trim() });

class TestValueObject extends ValueObject<typeof schema> {
  constructor(props: z.input<typeof schema>) {
    super(TestValueObject.parse(schema, props));
  }

  get value() {
    return this.props.value;
  }
}

describe('value object', () => {
  it('should be able to retain the normalized value', () => {
    const result = new TestValueObject({ value: '  test  ' });
    expect(result.value).toBe('test');
  });

  it('should not be able to create an instance with invalid values', () => {
    expect(
      () => new TestValueObject({ value: 1 } as unknown as z.input<typeof schema>),
    ).toThrow(EntityValidationError);
  });
});
