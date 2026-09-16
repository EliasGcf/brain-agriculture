import { z } from 'zod';

import { Entity } from '@core/entities/entity';
import { UniqueEntityID } from '@core/entities/unique-entity-id';

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string(),
});

export class User extends Entity<typeof schema> {
  static create(
    props: z.input<typeof schema>,
    id?: UniqueEntityID,
  ) {
    return new User(User.parse(schema, props), id);
  }

  get email() {
    return this.props.email;
  }

  get password() {
    return this.props.password;
  }
}
