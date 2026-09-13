import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { FarmFactory } from '@test/factories/make-farm.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';

describe('DeleteFarmController (e2e)', () => {
  let app: INestApplication<App>;
  let producerFactory: ProducerFactory;
  let farmsRepository: FarmsRepository;
  let farmFactory: FarmFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory, FarmFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    farmsRepository = moduleRef.get<FarmsRepository>(FarmsRepository);
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    await app.init();
  });

  afterAll(() => app.close());

  it('(DELETE) /farms/:id', async () => {
    const producer = await producerFactory.make();
    const farm = await farmFactory.make({ producerId: producer.id.toString() });

    await request(app.getHttpServer()).delete(`/farms/${farm.id}`).expect(204);
    await expect(farmsRepository.findById(farm.id.toString())).resolves.toBeNull();
  });
});
