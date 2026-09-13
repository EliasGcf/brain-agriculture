import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { HarvestPresenter } from '@infra/http/presenters/harvest.presenter';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';
import { FarmFactory } from '@test/factories/make-farm.factory';
import { HarvestFactory } from '@test/factories/make-harvest.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';

describe('UpdateHarvestController (e2e)', () => {
  let app: INestApplication<App>;
  let producerFactory: ProducerFactory;
  let farmFactory: FarmFactory;
  let harvestFactory: HarvestFactory;
  let harvestsRepository: HarvestsRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory, FarmFactory, HarvestFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    harvestFactory = moduleRef.get<HarvestFactory>(HarvestFactory);
    harvestsRepository = moduleRef.get<HarvestsRepository>(HarvestsRepository);
    await app.init();
  });

  afterAll(() => app.close());

  it('(PATCH) /harvests/:id', async () => {
    const producer = await producerFactory.make();
    const farm = await farmFactory.make({ producerId: producer.id.toString() });
    const harvest = await harvestFactory.make({ farmId: farm.id.toString() });

    const response = await request(app.getHttpServer())
      .patch(`/harvests/${harvest.id}`)
      .send({ name: 'Updated harvest' })
      .expect(200);

    const rawHarvest = await harvestsRepository.findById(response.body.id);

    expect(rawHarvest).not.toBeNull();
    expect(response.body).toEqual(HarvestPresenter.toHTTP(rawHarvest!));
  });
});
