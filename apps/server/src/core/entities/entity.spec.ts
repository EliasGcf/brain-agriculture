import { z } from 'zod';
import { EntityValidationError } from '../errors/common/entity-validation.error';
import { Entity } from './entity';
import { UniqueEntityID } from './unique-entity-id';

const schema = z.object({ name: z.string().trim() });

class TestEntity extends Entity<typeof schema> {
  constructor(props: z.input<typeof schema>, id?: UniqueEntityID) {
    super(TestEntity.parse(schema, props), id);
  }

  get name() {
    return this.props.name;
  }
}

describe('entity', () => {
  it('should be able to retain the normalized entity name', () => {
    const result = new TestEntity({ name: '  John  ' });
    expect(result.name).toBe('John');
  });

  it('should not be able to create an instance with invalid values', () => {
    expect(
      () => new TestEntity({ name: 1 } as unknown as z.input<typeof schema>),
    ).toThrow(EntityValidationError);
  });

  it('should be able to preserve a supplied entity ID', () => {
    const id = new UniqueEntityID('entity-id');
    const entity = new TestEntity({ name: 'John' }, id);

    expect(entity.id).toBe(id);
  });
});
