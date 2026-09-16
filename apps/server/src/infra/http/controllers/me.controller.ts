import { Controller, Get } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AUTH_COOKIE } from '@infra/auth/auth.constants';

@ApiTags('Auth')
@ApiCookieAuth(AUTH_COOKIE)
@Controller('me')
export class MeController {
  @Get()
  @ApiOkResponse({ schema: { example: { ok: true } } })
  handle() {
    return { ok: true };
  }
}
