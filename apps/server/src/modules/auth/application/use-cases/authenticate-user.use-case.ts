import { Injectable } from '@nestjs/common';

import { Encrypter } from '@modules/auth/application/cryptography/encrypter';
import { HashComparer } from '@modules/auth/application/cryptography/hash-comparer';
import { UsersRepository } from '@modules/auth/domain/repositories/users.repository';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';

interface Params {
  email: string;
  password: string;
}

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
  ) {}

  async execute(params: Params): Promise<{ accessToken: string }> {
    const user = await this.usersRepository.findByEmail(params.email.trim().toLowerCase());
    if (!user) throw new InvalidCredentialsError();

    const passwordMatches = await this.hashComparer.compare(params.password, user.password);
    if (!passwordMatches) throw new InvalidCredentialsError();

    const accessToken = await this.encrypter.encrypt({ sub: user.id.toString() });
    return { accessToken };
  }
}
