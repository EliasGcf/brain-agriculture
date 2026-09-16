import { User } from '@modules/auth/domain/entities/user';

export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<User | null>;
}
