import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { schema } from '@infra/database/drizzle/schema';
import { type DB, DRIZZLE } from '@infra/database/drizzle/drizzle.constants';
import { User } from '@modules/auth/domain/entities/user';
import { UsersRepository } from '@modules/auth/domain/repositories/users.repository';

import { DrizzleUserMapper } from './drizzle-user.mapper';

@Injectable()
export class DrizzleUsersRepository implements UsersRepository {
  constructor(@Inject(DRIZZLE) public readonly db: DB) {}

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.trim().toLowerCase()))
      .limit(1);

    if (!user) return null;

    return DrizzleUserMapper.toDomain(user);
  }
}
