import { INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
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
    app.use(cookieParser());
    app.useGlobalPipes(new StandardSchemaValidationPipe());
    await app.init();
  });

  afterAll(() => app.close());

  it('should be able to authenticate through POST /auth/login', async () => {
    const authCookie = await authenticate(app);

    expect(authCookie).toEqual(expect.stringContaining('access_token='));
    expect(authCookie).not.toContain('Bearer');
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

  it('should be able to access a protected route with the authentication cookie', async () => {
    const authCookie = await authenticate(app);

    await request(app.getHttpServer())
      .get('/producers')
      .set('Cookie', authCookie)
      .expect(200);
  });
});
