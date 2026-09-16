import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { CreateFarmBody } from '@infra/http/controllers/create-farm.controller';
import { HttpModule } from '@infra/http/http.module';
import { FarmPresenter } from '@infra/http/presenters/farm.presenter';

import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';

import { makeFarm } from '@test/factories/make-farm.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';
import { authenticate } from '@test/e2e-auth';

describe('CreateFarmController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;

  let producerFactory: ProducerFactory;
  let farmsRepository: FarmsRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());

    farmsRepository = moduleRef.get<FarmsRepository>(FarmsRepository);
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);

    await app.init();
    accessToken = await authenticate(app);
  });

  afterAll(() => app.close());

  it('(POST) /farms', async () => {
    const producer = await producerFactory.make();
    const farm = makeFarm({ producerId: producer.id.toString() });

    const data: CreateFarmBody = {
      name: farm.name,
      producerId: farm.producerId.toString(),
      city: farm.city,
      state: farm.state,
      totalArea: farm.totalArea.value,
      arableArea: farm.arableArea.value,
      vegetationArea: farm.vegetationArea.value,
    };

    const response = await request(app.getHttpServer())
      .post('/farms')
      .set('Cookie', accessToken)
      .send(data)
      .expect(201);

    const rawFarm = await farmsRepository.findById(response.body.id);

    expect(rawFarm).not.toBeNull();
    expect(response.body).toEqual(FarmPresenter.toHTTP(rawFarm!));
  });
});
