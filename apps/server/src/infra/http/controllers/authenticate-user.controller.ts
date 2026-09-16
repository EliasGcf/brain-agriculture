import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { z } from 'zod';

import { AuthenticateUserUseCase } from '@modules/auth/application/use-cases/authenticate-user.use-case';
import { Public } from '@infra/auth/public.decorator';
import { AUTH_COOKIE, COOKIES_CONFIG } from '@infra/auth/auth.constants';

const AuthenticateUserSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
});

@ApiTags('Auth')
@Controller('auth/login')
export class AuthenticateUserController {
  constructor(private readonly useCase: AuthenticateUserUseCase) {}

  @Post()
  @Public()
  @HttpCode(200)
  @ApiOperation({
    summary: 'Autenticar usuário',
    description: `Execute esta rota primeiro. Em caso de sucesso, o JWT será salvo automaticamente no cookie HttpOnly access_token. Não é necessário utilizar o botão Authorize.`,
  })
  @ApiOkResponse({
    description: `Login realizado. O JWT foi enviado no cookie HttpOnly access_token.`,
  })
  async handle(
    @Body({ schema: AuthenticateUserSchema })
    body: z.infer<typeof AuthenticateUserSchema>,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken } = await this.useCase.execute(body);

    response.cookie(AUTH_COOKIE, accessToken, COOKIES_CONFIG);

    return;
  }
}
