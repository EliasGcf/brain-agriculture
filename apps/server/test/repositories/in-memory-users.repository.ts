import { User } from '@modules/auth/domain/entities/user';
import { UsersRepository } from '@modules/auth/domain/repositories/users.repository';

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return this.items.find((item) => item.email === normalizedEmail) ?? null;
  }
}
