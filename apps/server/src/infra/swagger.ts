import { INestApplication } from '@nestjs/common';

import fs from 'node:fs/promises';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvService } from '@infra/env/env.service';

export function setupSwagger(app: INestApplication, env: EnvService) {
  const config = new DocumentBuilder()
    .setTitle('Brain Agriculture')
    .setDescription('API documentation for Brain Agriculture')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey) => controllerKey.replace(/Controller$/, ''),
  });

  SwaggerModule.setup('docs', app, document);

  if (env.get('NODE_ENV') === 'development') {
    fs.writeFile('./openapi.json', JSON.stringify(document, null, 2));
  }
}
