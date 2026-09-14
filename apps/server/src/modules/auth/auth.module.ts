import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { DatabaseModule } from '@infra/database/database.module';
import { AuthenticateUserController } from '@infra/http/controllers/authenticate-user.controller';
import { AuthenticateUserUseCase } from './application/use-cases/authenticate-user.use-case';
import { CryptographyModule } from './infra/cryptography/cryptography.module';
import { JwtAuthGuard } from './infra/http/jwt-auth.guard';

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [AuthenticateUserController],
  providers: [
    AuthenticateUserUseCase,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  exports: [AuthenticateUserUseCase],
})
export class AuthModule {}
