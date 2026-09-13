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
import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';

describe('CreatePlantedCropController (e2e)', () => {
  let app: INestApplication<App>;
  let producerFactory: ProducerFactory;
  let plantedCropsRepository: PlantedCropsRepository;
  let farmFactory: FarmFactory;
  let harvestFactory: HarvestFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory, FarmFactory, HarvestFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    plantedCropsRepository =
      moduleRef.get<PlantedCropsRepository>(PlantedCropsRepository);
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    harvestFactory = moduleRef.get<HarvestFactory>(HarvestFactory);
    await app.init();
  });

  afterAll(() => app.close());

  it('(POST) /planted-crops', async () => {
    const producer = await producerFactory.make();
    const farm = await farmFactory.make({ producerId: producer.id.toString() });
    const harvest = await harvestFactory.make({ farmId: farm.id.toString() });
    const crop = makePlantedCrop({ harvestId: harvest.id.toString() });
    const response = await request(app.getHttpServer())
      .post('/planted-crops')
      .send({ name: crop.name, harvestId: crop.harvestId })
      .expect(201);
    const rawPlantedCrop = await plantedCropsRepository.findById(response.body.id);

    expect(rawPlantedCrop).not.toBeNull();
    expect(response.body).toEqual(PlantedCropPresenter.toHTTP(rawPlantedCrop!));
  });
});
