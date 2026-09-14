import { INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AuthenticateUserUseCase } from '@modules/auth/application/use-cases/authenticate-user.use-case';
import { AuthenticateUserController } from './authenticate-user.controller';

describe('AuthenticateUserController (e2e)', () => {
  let app: INestApplication<App>;
  let useCase: { execute: jest.Mock };

  beforeAll(async () => {
    useCase = {
      execute: jest.fn().mockResolvedValue({ accessToken: 'access-token' }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthenticateUserController],
      providers: [{ provide: AuthenticateUserUseCase, useValue: useCase }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new StandardSchemaValidationPipe());
    await app.init();
  });

  afterAll(() => app.close());

  it('should be able to authenticate through POST /auth/login', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'maria@example.com', password: 'plain-password' })
      .expect(200)
      .expect({ access_token: 'access-token' });

    expect(useCase.execute).toHaveBeenCalledWith({
      email: 'maria@example.com',
      password: 'plain-password',
    });
  });

  it('should not be able to login with an invalid request body', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'invalid-email', password: '' })
      .expect(400);
  });
});
