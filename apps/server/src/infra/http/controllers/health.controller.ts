import { Controller, Get } from '@nestjs/common';

import { Public } from '@infra/auth/public.decorator';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  handle() {
    return { status: 'ok' };
  }
}
