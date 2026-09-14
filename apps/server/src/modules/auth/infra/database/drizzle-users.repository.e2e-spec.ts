import { Test, TestingModule } from '@nestjs/testing';
import { eq } from 'drizzle-orm';

import { DrizzleModule } from '@infra/database/drizzle/drizzle.module';
import { schema } from '@infra/database/drizzle/schema';
import { DrizzleUsersRepository } from '@modules/auth/infra/database/drizzle-users.repository';
import { UsersRepository } from '@modules/auth/domain/repositories/users.repository';
import { makeUser } from '@test/factories/make-user.factory';

describe('DrizzleUsersRepository', () => {
  let moduleRef: TestingModule;
  let usersRepository: DrizzleUsersRepository;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [DrizzleModule] }).compile();
    usersRepository = moduleRef.get(UsersRepository);
  });

  afterAll(() => moduleRef.close());

  it('should be able to persist and find a user by normalized email', async () => {
    const user = makeUser({ email: 'User@Example.com' });
    const [saved] = await usersRepository.db
      .insert(schema.users)
      .values({
        id: user.id.toString(),
        email: user.email,
        password: user.password,
      })
      .returning();

    expect(saved).toBeDefined();
    await expect(usersRepository.findByEmail(' user@example.com ')).resolves.toEqual(
      user,
    );
  });

  it('should not be able to persist users with a duplicate email', async () => {
    const user = makeUser({ email: 'duplicate@example.com' });
    await usersRepository.db.insert(schema.users).values({
      id: user.id.toString(),
      email: user.email,
      password: user.password,
    });

    await expect(
      usersRepository.db.insert(schema.users).values({
        id: makeUser().id.toString(),
        email: user.email,
        password: 'another-password',
      }),
    ).rejects.toThrow();

    const rows = await usersRepository.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, user.email));
    expect(rows).toHaveLength(1);
  });
});
