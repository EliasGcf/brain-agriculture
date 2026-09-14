import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';

import { AuthenticateUserUseCase } from '@modules/auth/application/use-cases/authenticate-user.use-case';
import { Public } from '@infra/auth/public.decorator';

const AuthenticateUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

@ApiTags('Auth')
@Controller('auth/login')
export class AuthenticateUserController {
  constructor(private readonly useCase: AuthenticateUserUseCase) {}

  @Post()
  @Public()
  @HttpCode(200)
  @ApiOkResponse()
  async handle(
    @Body({ schema: AuthenticateUserSchema })
    body: z.infer<typeof AuthenticateUserSchema>,
  ) {
    const { accessToken } = await this.useCase.execute(body);
    return { access_token: accessToken };
  }
}
