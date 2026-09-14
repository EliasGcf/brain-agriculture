import { INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { authenticate } from '@test/e2e-auth';

describe('AuthenticateUserController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new StandardSchemaValidationPipe());
    await app.init();
  });

  afterAll(() => app.close());

  it('should be able to authenticate through POST /auth/login', async () => {
    const accessToken = await authenticate(app);

    expect(accessToken).toEqual(expect.any(String));
  });

  it('should not be able to login with an invalid request body', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'invalid-email', password: '' })
      .expect(400);
  });

  it('should not be able to access a protected route without a token', async () => {
    await request(app.getHttpServer()).get('/producers').expect(401);
  });
});
