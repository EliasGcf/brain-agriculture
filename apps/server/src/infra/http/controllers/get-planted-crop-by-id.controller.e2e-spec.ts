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
import { authenticate } from '@test/e2e-auth';

describe('GetPlantedCropByIdController (e2e)', () => {
  let app: INestApplication<App>;
  let accessToken: string;
  let producerFactory: ProducerFactory;
  let farmFactory: FarmFactory;
  let harvestFactory: HarvestFactory;
  let plantedCropFactory: PlantedCropFactory;
  let plantedCropsRepository: PlantedCropsRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule, DatabaseModule],
      providers: [ProducerFactory, FarmFactory, HarvestFactory, PlantedCropFactory],
    }).compile();

    app = moduleRef.createNestApplication();
    producerFactory = moduleRef.get<ProducerFactory>(ProducerFactory);
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    harvestFactory = moduleRef.get<HarvestFactory>(HarvestFactory);
    plantedCropFactory = moduleRef.get<PlantedCropFactory>(PlantedCropFactory);
    plantedCropsRepository =
      moduleRef.get<PlantedCropsRepository>(PlantedCropsRepository);
    await app.init();
    accessToken = await authenticate(app);
  });

  afterAll(() => app.close());

  it('(GET) /planted-crops/:id', async () => {
    const producer = await producerFactory.make();
    const farm = await farmFactory.make({ producerId: producer.id.toString() });
    const harvest = await harvestFactory.make({ farmId: farm.id.toString() });
    const crop = await plantedCropFactory.make({ harvestId: harvest.id.toString() });

    const response = await request(app.getHttpServer())
      .get(`/planted-crops/${crop.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const rawPlantedCrop = await plantedCropsRepository.findById(response.body.id);

    expect(rawPlantedCrop).not.toBeNull();
    expect(response.body).toEqual(PlantedCropPresenter.toHTTP(rawPlantedCrop!));
  });
});
