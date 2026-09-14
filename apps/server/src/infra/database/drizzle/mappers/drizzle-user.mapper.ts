import { UniqueEntityID } from '@core/entities/unique-entity-id';
import { schema } from '@infra/database/drizzle/schema';
import { User } from '@modules/auth/domain/entities/user';

type RawUser = typeof schema.users.$inferSelect;
type RawInsertUser = typeof schema.users.$inferInsert;

export class DrizzleUserMapper {
  static toDomain(raw: RawUser): User {
    return User.create(
      {
        email: raw.email,
        password: raw.password,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toRaw(user: User): RawInsertUser {
    return {
      id: user.id.toValue(),
      email: user.email,
      password: user.password,
    };
  }
}
