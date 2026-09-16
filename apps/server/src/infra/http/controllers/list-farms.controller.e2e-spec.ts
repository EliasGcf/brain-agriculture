import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { FarmFactory } from '@test/factories/make-farm.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { FarmPresenter } from '@infra/http/presenters/farm.presenter';

describe('ListFarmsController (e2e)', () => {
  let app: INestApplication<App>;
  let farmFactory: FarmFactory;
  let producerFactory: ProducerFactory;
  let farmsRepository: FarmsRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [FarmFactory, ProducerFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    farmsRepository = moduleRef.get<FarmsRepository>(FarmsRepository);
    await app.init();
  });

  afterAll(() => app.close());

  it('(GET) /farms', async () => {
    const producer = await producerFactory.make({ name: 'Producer One' });
    const farm = await farmFactory.make({
      name: 'Green Valley',
      producerId: producer.id.toString(),
      city: 'Sao Paulo',
      state: 'SP',
    });

    const response = await request(app.getHttpServer())
      .get('/farms')
      .query({
        name: 'green',
        producerId: producer.id.toString(),
        city: 'sao',
        state: 'sp',
        page: 1,
        perPage: 10,
      })
      .expect(200);

    expect(response.body).toEqual(
      FarmPresenter.toPaginatedHTTP({
        items: [{ farm, owner: producer }],
        total: 1,
      }),
    );

    await farmsRepository.deleteById(farm.id.toString());
  });
});
