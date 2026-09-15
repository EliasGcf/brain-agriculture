import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { PlantedCropPresenter } from '@infra/http/presenters/planted-crop.presenter';
import { PlantedCropsRepository } from '@modules/farms/domain/repositories/planted-crops.repository';
import { FarmFactory } from '@test/factories/make-farm.factory';
import { HarvestFactory } from '@test/factories/make-harvest.factory';
import { PlantedCropFactory } from '@test/factories/make-planted-crop.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';

describe('ListPlantedCropsByHarvestController (e2e)', () => {
  let app: INestApplication<App>;
  let plantedCropsRepository: PlantedCropsRepository;
  let farmFactory: FarmFactory;
  let harvestFactory: HarvestFactory;
  let cropFactory: PlantedCropFactory;
  let producerFactory: ProducerFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory, FarmFactory, HarvestFactory, PlantedCropFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    plantedCropsRepository =
      moduleRef.get<PlantedCropsRepository>(PlantedCropsRepository);
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    harvestFactory = moduleRef.get<HarvestFactory>(HarvestFactory);
    cropFactory = moduleRef.get<PlantedCropFactory>(PlantedCropFactory);
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    await app.init();
  });

  afterAll(() => app.close());

  it('(GET) /harvests/:harvestId/planted-crops', async () => {
    const producer = await producerFactory.make();
    const farm = await farmFactory.make({ producerId: producer.id.toString() });
    const harvest = await harvestFactory.make({ farmId: farm.id.toString() });
    const crop = await cropFactory.make({ harvestId: harvest.id.toString() });

    const response = await request(app.getHttpServer())
      .get(`/harvests/${harvest.id}/planted-crops`)
      .expect(200);

    const rawPlantedCrop = await plantedCropsRepository.findById(crop.id.toString());

    expect(rawPlantedCrop).not.toBeNull();
    expect(response.body).toEqual([PlantedCropPresenter.toHTTP(rawPlantedCrop!)]);
  });
});
