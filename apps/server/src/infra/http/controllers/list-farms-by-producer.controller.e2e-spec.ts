import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { FarmPresenter } from '@infra/http/presenters/farm.presenter';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { FarmFactory } from '@test/factories/make-farm.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';
import { authenticate } from '@test/e2e-auth';

describe('ListFarmsByProducerController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let farmsRepository: FarmsRepository;
  let producerFactory: ProducerFactory;
  let farmFactory: FarmFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory, FarmFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    farmsRepository = moduleRef.get<FarmsRepository>(FarmsRepository);
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    await app.init();
    accessToken = await authenticate(app);
  });

  afterAll(() => app.close());

  it('(GET) /producers/:producerId/farms', async () => {
    const producer = await producerFactory.make();
    const farm = await farmFactory.make({ producerId: producer.id.toString() });

    const response = await request(app.getHttpServer())
      .get(`/producers/${producer.id}/farms`)
      .set('Cookie', accessToken)
      .expect(200);
    const rawFarm = await farmsRepository.findById(farm.id.toString());

    expect(rawFarm).not.toBeNull();
    expect(response.body).toEqual([FarmPresenter.toHTTP(rawFarm!)]);
  });
});
