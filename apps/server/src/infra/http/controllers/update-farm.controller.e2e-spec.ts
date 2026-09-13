import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { FarmPresenter } from '@infra/http/presenters/farm.presenter';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { FarmFactory } from '@test/factories/make-farm.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';

describe('UpdateFarmController (e2e)', () => {
  let app: INestApplication<App>;
  let producerFactory: ProducerFactory;
  let farmFactory: FarmFactory;
  let farmsRepository: FarmsRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory, FarmFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    farmsRepository = moduleRef.get<FarmsRepository>(FarmsRepository);
    await app.init();
  });

  afterAll(() => app.close());

  it('(PATCH) /farms/:id', async () => {
    const producer = await producerFactory.make();
    const farm = await farmFactory.make({ producerId: producer.id.toString() });

    const response = await request(app.getHttpServer())
      .patch(`/farms/${farm.id}`)
      .send({ name: 'Updated farm' })
      .expect(200);

    const rawFarm = await farmsRepository.findById(response.body.id);

    expect(rawFarm).not.toBeNull();
    expect(response.body).toEqual(FarmPresenter.toHTTP(rawFarm!));
  });
});
