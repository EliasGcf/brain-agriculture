import type {
  FarmResponse,
  HarvestResponse,
  PlantedCropResponse,
  ProducerResponse,
} from '../../src/store/api.generated';

const producer = (overrides: Partial<ProducerResponse> = {}): ProducerResponse => ({
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Ada Rural',
  document: '52998224725',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const farm = (overrides: Partial<FarmResponse> = {}): FarmResponse => ({
  id: '00000000-0000-4000-8000-000000000002',
  name: 'Green Acres',
  producerId: '00000000-0000-4000-8000-000000000001',
  city: 'Salvador',
  state: 'BA',
  totalArea: 100,
  arableArea: 60,
  vegetationArea: 20,
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const harvest = (overrides: Partial<HarvestResponse> = {}): HarvestResponse => ({
  id: '00000000-0000-4000-8000-000000000003',
  name: '2026 Harvest',
  farmId: '00000000-0000-4000-8000-000000000002',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const plantedCrop = (
  overrides: Partial<PlantedCropResponse> = {},
): PlantedCropResponse => ({
  id: '00000000-0000-4000-8000-000000000004',
  name: 'Corn',
  harvestId: '00000000-0000-4000-8000-000000000003',
  createdAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

export const mockData = {
  producers: [] as ProducerResponse[],
  farms: [] as FarmResponse[],
  harvests: [] as HarvestResponse[],
  plantedCrops: [] as PlantedCropResponse[],
};

const nextIds = {
  producers: 10,
  farms: 10,
  harvests: 10,
  plantedCrops: 10,
};

export type MockCollection = keyof typeof nextIds;

export const nextMockId = (collection: MockCollection): string => {
  const id = `00000000-0000-4000-8000-${String(nextIds[collection]).padStart(12, '0')}`;
  nextIds[collection] += 1;
  return id;
};

const initialData = {
  producers: [producer()],
  farms: [farm()],
  harvests: [harvest()],
  plantedCrops: [plantedCrop()],
};

export const resetMockData = (): void => {
  nextIds.producers = 10;
  nextIds.farms = 10;
  nextIds.harvests = 10;
  nextIds.plantedCrops = 10;
  mockData.producers = initialData.producers.map((record) => ({ ...record }));
  mockData.farms = initialData.farms.map((record) => ({ ...record }));
  mockData.harvests = initialData.harvests.map((record) => ({ ...record }));
  mockData.plantedCrops = initialData.plantedCrops.map((record) => ({ ...record }));
};

export const makeProducer = producer;
export const makeFarm = farm;
export const makeHarvest = harvest;
export const makePlantedCrop = plantedCrop;

resetMockData();
