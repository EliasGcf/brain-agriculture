import { z } from 'zod';
import { EntityValidationError } from '../errors/common/entity-validation.error';
import { UniqueEntityID } from './unique-entity-id';

export abstract class Entity<Props extends z.ZodType> {
  #id: UniqueEntityID;
  protected props: z.output<Props>;

  get id() {
    return this.#id;
  }

  protected constructor(props: z.output<Props>, id?: UniqueEntityID) {
    this.props = props;
    this.#id = id ?? new UniqueEntityID();
  }

  protected static parse<Schema extends z.ZodType>(
    schema: Schema,
    props: z.input<Schema>,
  ) {
    try {
      return schema.parse(props);
    } catch (error) {
      throw new EntityValidationError(error);
    }
  }

  public equals(entity: Entity<z.ZodType>) {
    if (entity === this) return true;
    if (entity.id === this.id) return true;
    return false;
  }
}
