import { makeUser } from '@test/factories/make-user.factory';
import { FakeEncrypter } from '@test/cryptography/fake-encrypter';
import { FakeHasher } from '@test/cryptography/fake-hasher';
import { InMemoryUsersRepository } from '@test/repositories/in-memory-users.repository';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { AuthenticateUserUseCase } from './authenticate-user.use-case';

describe('AuthenticateUserUseCase', () => {
  let usersRepository: InMemoryUsersRepository;
  let hasher: FakeHasher;
  let encrypter: FakeEncrypter;
  let useCase: AuthenticateUserUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    hasher = new FakeHasher();
    encrypter = new FakeEncrypter();
    useCase = new AuthenticateUserUseCase(usersRepository, hasher, encrypter);
  });

  it('should be able to authenticate a user with valid credentials', async () => {
    const user = makeUser({
      email: 'maria@example.com',
      password: await hasher.hash('plain-password'),
    });
    usersRepository.items = [user];

    await expect(
      useCase.execute({ email: ' MARIA@EXAMPLE.COM ', password: 'plain-password' }),
    ).resolves.toEqual({
      accessToken: JSON.stringify({ sub: user.id.toString() }),
    });
  });

  it('should not be able to authenticate with an unknown email', async () => {
    await expect(
      useCase.execute({ email: 'unknown@example.com', password: 'plain-password' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

  });

  it('should not be able to authenticate with a wrong password', async () => {
    usersRepository.items = [makeUser({
      email: 'maria@example.com',
      password: 'another-password-hashed',
    })];

    await expect(
      useCase.execute({ email: 'maria@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
