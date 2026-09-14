import { INestApplication } from '@nestjs/common';

import fs from 'node:fs/promises';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { EnvService } from '@infra/env/env.service';
import { AUTH_COOKIE } from '@infra/auth/auth.constants';

export function setupSwagger(app: INestApplication, env: EnvService) {
  const config = new DocumentBuilder()
    .setTitle('Brain Agriculture')
    .setDescription(`
## Autenticação

1. Execute primeiro a rota \`POST /auth/login\`.
2. O JWT será salvo automaticamente no cookie HttpOnly \`${AUTH_COOKIE}\`.
3. Não é necessário preencher o botão **Authorize**.
4. Depois disso, execute normalmente as rotas protegidas.
`)
    .setVersion('1.0')
    .addCookieAuth(AUTH_COOKIE, {
      type: 'apiKey',
      in: 'cookie',
      name: AUTH_COOKIE,
      description:
        'Não preencha manualmente. Execute POST /auth/login para que o cookie seja salvo automaticamente pelo navegador.',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey) => controllerKey.replace(/Controller$/, ''),
  });

  SwaggerModule.setup('docs', app, document);

  if (env.get('NODE_ENV') === 'development') {
    fs.writeFile('./openapi.json', JSON.stringify(document, null, 2));
  }
}
