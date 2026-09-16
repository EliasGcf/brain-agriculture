import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { HarvestPresenter } from '@infra/http/presenters/harvest.presenter';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';
import { FarmFactory } from '@test/factories/make-farm.factory';
import { HarvestFactory } from '@test/factories/make-harvest.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';
import { authenticate } from '@test/e2e-auth';

describe('ListHarvestsByFarmController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let harvestsRepository: HarvestsRepository;
  let farmFactory: FarmFactory;
  let harvestFactory: HarvestFactory;
  let producerFactory: ProducerFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory, FarmFactory, HarvestFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    harvestsRepository = moduleRef.get<HarvestsRepository>(HarvestsRepository);
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    harvestFactory = moduleRef.get<HarvestFactory>(HarvestFactory);
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    await app.init();
    accessToken = await authenticate(app);
  });

  afterAll(() => app.close());

  it('(GET) /farms/:farmId/harvests', async () => {
    const producer = await producerFactory.make();
    const farm = await farmFactory.make({ producerId: producer.id.toString() });
    const harvest = await harvestFactory.make({ farmId: farm.id.toString() });

    const response = await request(app.getHttpServer())
      .get(`/farms/${farm.id}/harvests`)
      .set('Cookie', accessToken)
      .expect(200);

    const rawHarvest = await harvestsRepository.findById(harvest.id.toString());

    expect(rawHarvest).not.toBeNull();
    expect(response.body).toEqual([HarvestPresenter.toHTTP(rawHarvest!)]);
  });
});
