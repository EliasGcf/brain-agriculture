import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { PlantedCropsRepository } from '@modules/farms/domain/repositories/planted-crops.repository';
import { FarmFactory } from '@test/factories/make-farm.factory';
import { HarvestFactory } from '@test/factories/make-harvest.factory';
import { PlantedCropFactory } from '@test/factories/make-planted-crop.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';

describe('DeletePlantedCropController (e2e)', () => {
  let app: INestApplication<App>;
  let producerFactory: ProducerFactory;
  let plantedCropsRepository: PlantedCropsRepository;
  let farmFactory: FarmFactory;
  let harvestFactory: HarvestFactory;
  let plantedCropFactory: PlantedCropFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory, FarmFactory, HarvestFactory, PlantedCropFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    plantedCropsRepository =
      moduleRef.get<PlantedCropsRepository>(PlantedCropsRepository);
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    harvestFactory = moduleRef.get<HarvestFactory>(HarvestFactory);
    plantedCropFactory = moduleRef.get<PlantedCropFactory>(PlantedCropFactory);
    await app.init();
  });

  afterAll(() => app.close());

  it('(DELETE) /planted-crops/:id', async () => {
    const producer = await producerFactory.make();
    const farm = await farmFactory.make({ producerId: producer.id.toString() });
    const harvest = await harvestFactory.make({ farmId: farm.id.toString() });
    const crop = await plantedCropFactory.make({ harvestId: harvest.id.toString() });

    await request(app.getHttpServer()).delete(`/planted-crops/${crop.id}`).expect(204);
    await expect(plantedCropsRepository.findById(crop.id.toString())).resolves.toBeNull();
  });
});
