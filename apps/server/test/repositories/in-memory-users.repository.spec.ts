import { makeUser } from '../factories/make-user.factory';

import { InMemoryUsersRepository } from './in-memory-users.repository';

describe('InMemoryUsersRepository', () => {
  let repository: InMemoryUsersRepository;

  beforeEach(() => {
    repository = new InMemoryUsersRepository();
  });

  it('should be able to find an inserted user by normalized email', async () => {
    const user = makeUser({ email: 'User@Example.com' });
    repository.items.push(user);

    await expect(repository.findByEmail(' user@example.com ')).resolves.toBe(user);
  });

  it('should not be able to find a user with an unknown email', async () => {
    await expect(repository.findByEmail('unknown@example.com')).resolves.toBeNull();
  });
});
