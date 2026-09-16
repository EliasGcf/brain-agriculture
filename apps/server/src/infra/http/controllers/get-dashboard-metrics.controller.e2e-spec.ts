import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DatabaseModule } from '@infra/database/database.module';
import { HttpModule } from '@infra/http/http.module';
import { FarmFactory } from '@test/factories/make-farm.factory';
import { ProducerFactory } from '@test/factories/make-producer.factory';
import { HarvestFactory } from '@test/factories/make-harvest.factory';
import { PlantedCropFactory } from '@test/factories/make-planted-crop.factory';
import { Area } from '@modules/farms/domain/value-objects/area';
import { randomUUID } from 'node:crypto';

describe('GetDashboardMetricsController (e2e)', () => {
  let app: INestApplication<App>;
  let producerFactory: ProducerFactory;
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
    farmFactory = moduleRef.get<FarmFactory>(FarmFactory);
    harvestFactory = moduleRef.get<HarvestFactory>(HarvestFactory);
    plantedCropFactory = moduleRef.get<PlantedCropFactory>(PlantedCropFactory);
    await app.init();
  });

  afterAll(() => app.close());

  it('(GET) /metrics', async () => {
    const producer = await producerFactory.make();
    const farm = await farmFactory.make({
      producerId: producer.id.toString(),
      state: 'METRICS',
      totalArea: Area.create(0.7),
      arableArea: Area.create(0.6),
      vegetationArea: Area.create(0.1),
    });
    await farmFactory.make({
      producerId: producer.id.toString(),
      totalArea: Area.create(1),
      arableArea: Area.create(0.5),
      vegetationArea: Area.create(0.25),
    });
    const firstHarvest = await harvestFactory.make({ farmId: farm.id.toString() });
    const secondHarvest = await harvestFactory.make({ farmId: farm.id.toString() });
    const crop = `Dashboard Crop ${randomUUID()}`;
    await plantedCropFactory.make({ harvestId: firstHarvest.id.toString(), name: crop });
    await plantedCropFactory.make({ harvestId: secondHarvest.id.toString(), name: crop.toLowerCase() });

    const response = await request(app.getHttpServer()).get('/metrics').expect(200);

    expect(response.body).toEqual(expect.objectContaining({
      farmCount: expect.any(Number),
      producerCount: expect.any(Number),
      totalHectares: expect.any(Number),
      landUse: expect.objectContaining({
        arableArea: expect.any(Number),
        vegetationArea: expect.any(Number),
        otherUses: expect.any(Number),
      }),
    }));
    expect(response.body.hectaresByState).toContainEqual({ state: 'METRICS', hectares: 0.7 });
    expect(
      response.body.farmsByCrop.find(
        (item: { crop: string }) => item.crop.toLowerCase() === crop.toLowerCase(),
      ),
    ).toEqual({ crop: expect.any(String), farms: 1 });
    expect(response.body.hectaresByState).toEqual(
      [...response.body.hectaresByState].sort(
        (first: { state: string; hectares: number }, second: { state: string; hectares: number }) =>
          second.hectares - first.hectares || first.state.localeCompare(second.state),
      ),
    );
    expect(response.body.farmsByCrop).toEqual(
      [...response.body.farmsByCrop].sort(
        (first: { crop: string; farms: number }, second: { crop: string; farms: number }) =>
          second.farms - first.farms || first.crop.localeCompare(second.crop),
      ),
    );
  });
});
