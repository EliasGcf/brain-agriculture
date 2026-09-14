import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';
import { FarmFactory } from '@test/factories/make-farm.factory';
import { HarvestFactory } from '@test/factories/make-harvest.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';
import { authenticate } from '@test/e2e-auth';

describe('DeleteHarvestController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let producerFactory: ProducerFactory;
  let harvestsRepository: HarvestsRepository;
  let farmFactory: FarmFactory;
  let harvestFactory: HarvestFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory, FarmFactory, HarvestFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    harvestsRepository = moduleRef.get<HarvestsRepository>(HarvestsRepository);
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    harvestFactory = moduleRef.get<HarvestFactory>(HarvestFactory);
    await app.init();
    accessToken = await authenticate(app);
  });

  afterAll(() => app.close());

  it('(DELETE) /harvests/:id', async () => {
    const producer = await producerFactory.make();
    const farm = await farmFactory.make({ producerId: producer.id.toString() });
    const harvest = await harvestFactory.make({ farmId: farm.id.toString() });

    await request(app.getHttpServer())
      .delete(`/harvests/${harvest.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
    await expect(harvestsRepository.findById(harvest.id.toString())).resolves.toBeNull();
  });
});
