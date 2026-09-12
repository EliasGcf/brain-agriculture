import { z } from 'zod'
import { EntityValidationError } from '../errors/common/entity-validation-error'
import { Entity } from './entity'

const schema = z.object({ name: z.string() })

class TestEntity extends Entity<typeof schema> {
  constructor(props: z.input<typeof schema>) {
    super(TestEntity.parse(schema, props))
  }
}

describe('entity', () => {
  it('parses props with the entity schema', () => {
    expect(() => new TestEntity({ name: 'John' })).not.toThrow()
  })

  it('throws a common error when props are invalid', () => {
    expect(() => new TestEntity({ name: 1 } as unknown as z.input<typeof schema>)).toThrow(
      EntityValidationError,
    )
  })
})
