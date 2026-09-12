import { z } from 'zod';
import { EntityValidationError } from '../errors/common/entity-validation-error';
import { Entity } from './entity';
import { UniqueEntityID } from './unique-entity-id';

const schema = z.object({ name: z.string() });

class TestEntity extends Entity<typeof schema> {
  constructor(props: z.input<typeof schema>, id?: UniqueEntityID) {
    super(TestEntity.parse(schema, props), id);
  }
}

describe('entity', () => {
  it('parses props with the entity schema', () => {
    expect(() => new TestEntity({ name: 'John' })).not.toThrow();
  });

  it('throws a common error when props are invalid', () => {
    expect(
      () => new TestEntity({ name: 1 } as unknown as z.input<typeof schema>),
    ).toThrow(EntityValidationError);
  });

  it('preserves the id received by the constructor', () => {
    const id = new UniqueEntityID('entity-id');
    const entity = new TestEntity({ name: 'John' }, id);

    expect(entity.id).toBe(id);
  });
});
