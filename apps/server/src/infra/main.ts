import { StandardSchemaValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NativeLogger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { EnvService } from '@infra/env/env.service';
import { setupSwagger } from '@infra/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(NativeLogger);
  app.useLogger(logger);

  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  const env = app.get(EnvService);

  setupSwagger(app, env);

  await app.listen(env.get('PORT'));
  logger.log(`Server is running on port ${env.get('PORT')}`);
}

bootstrap();
