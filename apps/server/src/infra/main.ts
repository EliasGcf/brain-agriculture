import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { StandardSchemaValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { EnvService } from '@infra/env/env.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Brain Agriculture')
    .setDescription('API documentation for Brain Agriculture')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory);

  const env = app.get(EnvService);

  await app.listen(env.get('PORT'));
}

bootstrap();
