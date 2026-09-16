import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { authenticate } from '@test/e2e-auth';

describe('LogoutUserController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(() => app.close());

  it('should be able to logout with a valid authentication cookie', async () => {
    const authCookie = await authenticate(app);

    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', authCookie)
      .expect(204);

    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('access_token=;')]),
    );
  });

  it('should not be able to logout without an authentication cookie', async () => {
    await request(app.getHttpServer()).post('/auth/logout').expect(401);
  });
});
