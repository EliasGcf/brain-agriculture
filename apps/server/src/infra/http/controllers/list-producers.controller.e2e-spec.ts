import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { ProducerPresenter } from '@infra/http/presenters/producer.presenter';
import { ProducersRepository } from '@modules/producers/domain/repositories/producers.repository';
import { FarmFactory } from '@test/factories/make-farm.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';
import { authenticate } from '@test/e2e-auth';

describe('ListProducersController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let producerFactory: ProducerFactory;
  let farmFactory: FarmFactory;
  let producersRepository: ProducersRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory, FarmFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    producersRepository = moduleRef.get<ProducersRepository>(ProducersRepository);
    await app.init();
    accessToken = await authenticate(app);
  });

  afterAll(() => app.close());

  it('(GET) /producers', async () => {
    const producer = await producerFactory.make({ name: 'Listed producer' });

    const response = await request(app.getHttpServer())
      .get('/producers')
      .set('Cookie', accessToken)
      .query({ search: producer.name })
      .expect(200);

    const persistedProducers = await producersRepository.findMany({
      search: producer.name,
      page: 1,
      perPage: 10,
    });

    expect(response.body).toEqual(ProducerPresenter.toPaginatedHTTP(persistedProducers));
  });

  it('should be able to include the number of farms for each producer', async () => {
    const producer = await producerFactory.make({ name: 'Producer with farms' });
    await farmFactory.make({ producerId: producer.id.toString() });
    await farmFactory.make({ producerId: producer.id.toString() });

    const response = await request(app.getHttpServer())
      .get('/producers')
      .set('Cookie', accessToken)
      .query({ search: producer.name });

    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: producer.id.toString(),
        farmsCount: 2,
      }),
    ]);
  });
});
