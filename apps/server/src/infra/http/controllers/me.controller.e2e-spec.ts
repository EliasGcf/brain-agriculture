import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { authenticate } from '@test/e2e-auth';

describe('MeController (e2e)', () => {
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

  it('should be able to check authentication with a valid cookie', async () => {
    const authCookie = await authenticate(app);

    await request(app.getHttpServer())
      .get('/me')
      .set('Cookie', authCookie)
      .expect(200)
      .expect({ ok: true });
  });

  it('should not be able to check authentication without a valid cookie', async () => {
    await request(app.getHttpServer()).get('/me').expect(401);
  });
});
