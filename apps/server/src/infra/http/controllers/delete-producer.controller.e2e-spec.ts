import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { ProducerFactory } from '@test/factories/make-producer.factory';

describe('DeleteProducerController (e2e)', () => {
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

  it('(DELETE) /producers/:id', async () => {
    const producer = await producerFactory.make();

    await request(app.getHttpServer()).delete(`/producers/${producer.id}`).expect(204);
    await expect(
      producersRepository.findById(producer.id.toString()),
    ).resolves.toBeNull();
  });
});
