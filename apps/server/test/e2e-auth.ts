import { randomUUID } from 'node:crypto';

import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';

import { DRIZZLE, type DB } from '@infra/database/drizzle/drizzle.constants';
import { schema } from '@infra/database/drizzle/schema';

export async function authenticate(app: INestApplication<App>) {
  const email = `admin-${randomUUID()}@example.com`;
  const password = 'plain-password';
  const db = app.get<DB>(DRIZZLE);

  await db.insert(schema.users).values({
    id: randomUUID(),
    email,
    password: await bcrypt.hash(password, 8),
  });

  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(200);

  return response.body.access_token as string;
}
