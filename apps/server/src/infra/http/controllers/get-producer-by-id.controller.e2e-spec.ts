import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { ProducerPresenter } from '@infra/http/presenters/producer.presenter';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { ProducerFactory } from '@test/factories/make-producer.factory';

describe('GetProducerByIdController (e2e)', () => {
  let app: INestApplication<App>;
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
  });

  afterAll(() => app.close());

  it('(GET) /producers/:id', async () => {
    const producer = await producerFactory.make();
    const response = await request(app.getHttpServer())
      .get(`/producers/${producer.id}`)
      .expect(200);

    const savedProducer = await producersRepository.findById(response.body.id);

    expect(savedProducer).not.toBeNull();
    expect(response.body).toEqual(ProducerPresenter.toHTTP(savedProducer!));
  });
});
