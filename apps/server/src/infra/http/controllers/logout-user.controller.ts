import { Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiCookieAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { AUTH_COOKIE } from '@infra/auth/auth.constants';

@ApiTags('Auth')
@ApiCookieAuth(AUTH_COOKIE)
@Controller('auth/logout')
export class LogoutUserController {
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  handle(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(AUTH_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
    });
  }
}
