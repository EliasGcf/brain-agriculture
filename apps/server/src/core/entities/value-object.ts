import { z } from 'zod'
import { EntityValidationError } from '../errors/common/entity-validation-error'

export abstract class ValueObject<Props extends z.ZodType> {
  protected props: z.output<Props>

  protected constructor(props: z.output<Props>) {
    this.props = props
  }

  protected static parse<Schema extends z.ZodType>(schema: Schema, props: z.input<Schema>) {
    try {
      return schema.parse(props)
    } catch (error) {
      throw new EntityValidationError(error)
    }
  }

  public equals(vo: ValueObject<z.ZodType>) {
    if (vo === null || vo === undefined) return false
    if (vo.props === undefined) return false
    return JSON.stringify(vo.props) === JSON.stringify(this.props)
  }
}
