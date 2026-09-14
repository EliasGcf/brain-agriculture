import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { ProducerPresenter } from '@infra/http/presenters/producer.presenter';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { ProducerFactory } from '@test/factories/make-producer.factory';
import { authenticate } from '@test/e2e-auth';

describe('UpdateProducerController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let producerFactory: ProducerFactory;
  let producersRepository: ProducersRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    producersRepository = moduleRef.get<ProducersRepository>(ProducersRepository);
    await app.init();
    accessToken = await authenticate(app);
  });

  afterAll(() => app.close());

  it('(PATCH) /producers/:id', async () => {
    const producer = await producerFactory.make();

    const response = await request(app.getHttpServer())
      .patch(`/producers/${producer.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated producer' })
      .expect(200);

    const rawProducer = await producersRepository.findById(response.body.id);

    expect(rawProducer).not.toBeNull();
    expect(response.body).toEqual(ProducerPresenter.toHTTP(rawProducer!));
  });
});
