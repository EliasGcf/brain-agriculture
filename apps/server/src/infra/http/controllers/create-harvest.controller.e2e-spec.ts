import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { HarvestPresenter } from '@infra/http/presenters/harvest.presenter';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';
import { makeHarvest } from '@test/factories/make-harvest.factory';
import { FarmFactory } from '@test/factories/make-farm.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';

describe('CreateHarvestController (e2e)', () => {
  let app: INestApplication<App>;
  let producerFactory: ProducerFactory;
  let harvestsRepository: HarvestsRepository;
  let farmFactory: FarmFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory, FarmFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    harvestsRepository = moduleRef.get<HarvestsRepository>(HarvestsRepository);
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    await app.init();
  });

  afterAll(() => app.close());

  it('(POST) /harvests', async () => {
    const producer = await producerFactory.make();
    const farm = await farmFactory.make({ producerId: producer.id.toString() });
    const harvest = makeHarvest({ farmId: farm.id.toString() });
    const response = await request(app.getHttpServer())
      .post('/harvests')
      .send({ name: harvest.name, farmId: harvest.farmId })
      .expect(201);
    const rawHarvest = await harvestsRepository.findById(response.body.id);

    expect(rawHarvest).not.toBeNull();
    expect(response.body).toEqual(HarvestPresenter.toHTTP(rawHarvest!));
  });
});
