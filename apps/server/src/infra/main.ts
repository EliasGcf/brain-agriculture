import { StandardSchemaValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { NativeLogger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { EnvService } from '@infra/env/env.service';
import { setupSwagger } from '@infra/swagger';
import { setupCors } from "@infra/cors";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const env = app.get(EnvService);

  const logger = app.get(NativeLogger);
  app.useLogger(logger);

  setupCors(app, env);
  app.enableShutdownHooks();
  app.use(cookieParser());
  app.useGlobalPipes(new StandardSchemaValidationPipe());


  setupSwagger(app, env);

  await app.listen(env.get('PORT'));
  logger.log(`Server is running on port ${env.get('PORT')}`);
}

bootstrap();
