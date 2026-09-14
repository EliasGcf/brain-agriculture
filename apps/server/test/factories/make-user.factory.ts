import { faker } from '@faker-js/faker';

import { User } from '@modules/auth/domain/entities/user';

type Overrides = Partial<{
  email: string;
  password: string;
}>;

export function makeUser(overrides: Overrides = {}) {
  return User.create({
    email: overrides.email ?? faker.internet.email(),
    password: overrides.password ?? faker.internet.password(),
  });
}
