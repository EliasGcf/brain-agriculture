import { INestApplication } from '@nestjs/common';

import { EnvService } from '@infra/env/env.service';

export function setupCors(app: INestApplication, env: EnvService) {
  app.enableCors({
    origin: env.isProd ? env.get('ALLOWED_ORIGIN') : true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86_400,
  });
}
