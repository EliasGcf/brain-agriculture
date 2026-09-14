import { UniqueEntityID } from '@core/entities/unique-entity-id';
import { Encrypter } from '@modules/auth/application/cryptography/encrypter';
import { HashComparer } from '@modules/auth/application/cryptography/hash-comparer';
import { User } from '@modules/auth/domain/entities/user';
import { UsersRepository } from '@modules/auth/domain/repositories/users.repository';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { AuthenticateUserUseCase } from './authenticate-user.use-case';

class InMemoryUsersRepository implements UsersRepository {
  user: User | null = null;
  receivedEmail?: string;

  async findByEmail(email: string): Promise<User | null> {
    this.receivedEmail = email;
    return this.user;
  }
}

class FakeHashComparer implements HashComparer {
  result = true;
  receivedPlain?: string;
  receivedHash?: string;

  async compare(plain: string, hash: string): Promise<boolean> {
    this.receivedPlain = plain;
    this.receivedHash = hash;
    return this.result;
  }
}

class FakeEncrypter implements Encrypter {
  payload?: Record<string, unknown>;

  async encrypt(payload: Record<string, unknown>): Promise<string> {
    this.payload = payload;
    return 'access-token';
  }
}

describe('AuthenticateUserUseCase', () => {
  let usersRepository: InMemoryUsersRepository;
  let hashComparer: FakeHashComparer;
  let encrypter: FakeEncrypter;
  let useCase: AuthenticateUserUseCase;

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    hashComparer = new FakeHashComparer();
    encrypter = new FakeEncrypter();
    useCase = new AuthenticateUserUseCase(usersRepository, hashComparer, encrypter);
  });

  it('should be able to authenticate a user with valid credentials', async () => {
    const user = User.create(
      { email: 'maria@example.com', password: 'hashed-password' },
      new UniqueEntityID('user-id'),
    );
    usersRepository.user = user;

    await expect(
      useCase.execute({ email: ' MARIA@EXAMPLE.COM ', password: 'plain-password' }),
    ).resolves.toEqual({ accessToken: 'access-token' });

    expect(usersRepository.receivedEmail).toBe('maria@example.com');
    expect(hashComparer.receivedPlain).toBe('plain-password');
    expect(hashComparer.receivedHash).toBe('hashed-password');
    expect(encrypter.payload).toEqual({ sub: 'user-id' });
  });

  it('should not be able to authenticate with an unknown email', async () => {
    await expect(
      useCase.execute({ email: 'unknown@example.com', password: 'plain-password' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it('should not be able to authenticate with a wrong password', async () => {
    usersRepository.user = User.create({
      email: 'maria@example.com',
      password: 'hashed-password',
    });
    hashComparer.result = false;

    await expect(
      useCase.execute({ email: 'maria@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
