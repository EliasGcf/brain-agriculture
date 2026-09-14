import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { Encrypter } from '@modules/auth/application/cryptography/encrypter';
import { HashComparer } from '@modules/auth/application/cryptography/hash-comparer';
import { HashGenerator } from '@modules/auth/application/cryptography/hash-generator';
import { EnvModule } from '@infra/env/env.module';
import { EnvService } from '@infra/env/env.service';

import { BcryptHasher } from './bcrypt-hasher';
import { JwtEncrypter } from './jwt-encrypter';

@Module({
  imports: [
    EnvModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (env: EnvService) => ({
        secret: env.get('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  providers: [
    BcryptHasher,
    JwtEncrypter,
    { provide: HashGenerator, useExisting: BcryptHasher },
    { provide: HashComparer, useExisting: BcryptHasher },
    { provide: Encrypter, useExisting: JwtEncrypter },
  ],
  exports: [HashGenerator, HashComparer, Encrypter, JwtService],
})
export class CryptographyModule {}
