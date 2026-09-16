import { http, HttpResponse } from 'msw';
import type {
  CreateFarmApiArg,
  CreateHarvestApiArg,
  CreatePlantedCropApiArg,
  CreateProducerApiArg,
  DashboardMetricsResponse,
  UpdateFarmApiArg,
  UpdateHarvestApiArg,
  UpdatePlantedCropApiArg,
  UpdateProducerApiArg,
} from '../../src/store/api/api.generated';

import {
  makeFarm,
  makeHarvest,
  makeDocumentResponse,
  makePlantedCrop,
  makeProducer,
  mockData,
  nextMockId,
} from './data';
import { env } from "../../src/env";

const baseUrl = (env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const route = (path: string) => `${baseUrl}${path}`;
const brasilApiBaseUrl = (env.VITE_BRASIL_API_BASE_URL).replace(/\/+$/, '');
const brasilRoute = (path: string) => `${brasilApiBaseUrl}${path}`;

const notFound = () => HttpResponse.json({ message: 'Not found' }, { status: 404 });
const parseBody = async <T>(request: Request): Promise<T> => (await request.json()) as T;

/**
 * We are creating the handlers manually,
 * but there are tools that can generate them automatically from OpenAPI,
 * such as https://orval.dev/docs/guides/msw/#basic-setup.
 *
 * However, since this project is already using RTK Query with its own codegen,
 * I don't see the point in adding another codegen tool, especially since Orval does not support RTK Query.
 */
export const handlers = [
  http.post(route('/auth/login'), () => new HttpResponse(null, { status: 200 })),
  http.get(route('/me'), () => HttpResponse.json({ ok: true })),
  http.post(route('/auth/logout'), () => new HttpResponse(null, { status: 204 })),
  http.get(brasilRoute('/ibge/municipios/v1/:uf'), () =>
    HttpResponse.json([{ nome: 'Salvador', codigo_ibge: '2927408' }]),
  ),
  http.get(route('/producers'), ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.trim();
    const normalizedSearch = search?.replace(/[^\p{L}\p{N}]/gu, '');
    const page = Number(url.searchParams.get('page') ?? 1);
    const perPage = Number(url.searchParams.get('perPage') ?? 10);
    const filtered = mockData.producers.filter((item) =>
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      Boolean(normalizedSearch) && item.document.value.includes(normalizedSearch!),
    );
    const start = Math.max(0, page - 1) * perPage;
    const items = filtered.slice(start, start + perPage).map((producer) => ({
      ...producer,
      farmsCount: mockData.farms.filter((farm) => farm.producerId === producer.id).length,
    }));
    return HttpResponse.json({ items, total: filtered.length });
  }),
  http.post(route('/producers'), async ({ request }) => {
    const body = await parseBody<CreateProducerApiArg['body']>(request);
    const record = makeProducer({
      ...body,
      document: makeDocumentResponse(body.document!),
      id: nextMockId('producers'),
    });
    mockData.producers.push(record);
    return HttpResponse.json(record, { status: 201 });
  }),
  http.get(route('/producers/:id'), ({ params }) => {
    const record = mockData.producers.find((item) => item.id === params.id);
    return record ? HttpResponse.json(record) : notFound();
  }),
  http.patch(route('/producers/:id'), async ({ params, request }) => {
    const record = mockData.producers.find((item) => item.id === params.id);
    if (!record) return notFound();
    const body = await parseBody<UpdateProducerApiArg['body']>(request);
    Object.assign(record, {
      ...body,
      ...(body.document
        ? {
            document: {
              ...makeDocumentResponse(body.document),
            },
          }
        : {}),
    });
    return HttpResponse.json(record);
  }),
  http.delete(route('/producers/:id'), ({ params }) => {
    const index = mockData.producers.findIndex((item) => item.id === params.id);
    if (index < 0) return notFound();
    if (mockData.farms.some((farm) => farm.producerId === params.id)) {
      return HttpResponse.json({ message: 'Producer has farms' }, { status: 403 });
    }
    mockData.producers.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(route('/producers/:producerId/farms'), ({ params }) => {
    const records = mockData.farms.filter((farm) => farm.producerId === params.producerId);
    return HttpResponse.json(records);
  }),

  http.get(route('/farms'), ({ request }) => {
    const url = new URL(request.url);
    const name = url.searchParams.get('name')?.toLowerCase();
    const city = url.searchParams.get('city')?.toLowerCase();
    const state = url.searchParams.get('state')?.toLowerCase();
    const producerId = url.searchParams.get('producerId');
    const page = Number(url.searchParams.get('page') ?? 1);
    const perPage = Number(url.searchParams.get('perPage') ?? 10);
    const filtered = mockData.farms.filter((farm) =>
      (!name || farm.name.toLowerCase().includes(name)) &&
      (!city || farm.city.toLowerCase().includes(city)) &&
      (!state || farm.state.toLowerCase().includes(state)) &&
      (!producerId || farm.producerId === producerId),
    );
    const start = Math.max(0, page - 1) * perPage;
    return HttpResponse.json({
      items: filtered.slice(start, start + perPage),
      total: filtered.length,
    });
  }),

  http.get(route('/metrics'), () => {
    const farmCount = mockData.farms.length;
    const totalHectares = mockData.farms.reduce((total, farm) => total + farm.totalArea, 0);
    const hectaresByState = Array.from(
      mockData.farms.reduce((areas, farm) => {
        areas.set(farm.state, (areas.get(farm.state) ?? 0) + farm.totalArea);
        return areas;
      }, new Map<string, number>()),
    )
      .map(([state, hectares]) => ({ state, hectares }))
      .sort((first, second) => second.hectares - first.hectares || first.state.localeCompare(second.state));
    const farmIdsByCrop = new Map<string, Set<string>>();

    for (const plantedCrop of mockData.plantedCrops) {
      const harvest = mockData.harvests.find((item) => item.id === plantedCrop.harvestId);
      if (!harvest) continue;
      const farm = mockData.farms.find((item) => item.id === harvest.farmId);
      if (!farm) continue;
      const farmIds = farmIdsByCrop.get(plantedCrop.name) ?? new Set<string>();
      farmIds.add(farm.id);
      farmIdsByCrop.set(plantedCrop.name, farmIds);
    }

    const response: DashboardMetricsResponse = {
      farmCount,
      producerCount: mockData.producers.length,
      totalHectares,
      hectaresByState,
      farmsByCrop: Array.from(farmIdsByCrop, ([crop, farms]) => ({ crop, farms: farms.size })).sort(
        (first, second) => second.farms - first.farms || first.crop.localeCompare(second.crop),
      ),
      landUse: {
        arableArea: mockData.farms.reduce((total, farm) => total + farm.arableArea, 0),
        vegetationArea: mockData.farms.reduce((total, farm) => total + farm.vegetationArea, 0),
        otherUses: mockData.farms.reduce(
          (total, farm) => total + farm.totalArea - farm.arableArea - farm.vegetationArea,
          0,
        ),
      },
    };

    return HttpResponse.json(response);
  }),

  http.post(route('/farms'), async ({ request }) => {
    const record = makeFarm({
      ...(await parseBody<CreateFarmApiArg['body']>(request)),
      id: nextMockId('farms'),
    });
    mockData.farms.push(record);
    return HttpResponse.json(record, { status: 201 });
  }),
  http.get(route('/farms/:id'), ({ params }) => {
    const record = mockData.farms.find((item) => item.id === params.id);
    return record ? HttpResponse.json(record) : notFound();
  }),
  http.patch(route('/farms/:id'), async ({ params, request }) => {
    const record = mockData.farms.find((item) => item.id === params.id);
    if (!record) return notFound();
    Object.assign(record, await parseBody<UpdateFarmApiArg['body']>(request));
    return HttpResponse.json(record);
  }),
  http.delete(route('/farms/:id'), ({ params }) => {
    const index = mockData.farms.findIndex((item) => item.id === params.id);
    if (index < 0) return notFound();
    mockData.farms.splice(index, 1);
    const harvestIds = mockData.harvests
      .filter((item) => item.farmId === params.id)
      .map((item) => item.id);
    mockData.harvests = mockData.harvests.filter((item) => item.farmId !== params.id);
    mockData.plantedCrops = mockData.plantedCrops.filter(
      (item) => !harvestIds.includes(item.harvestId),
    );
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(route('/farms/:farmId/harvests'), ({ params }) => {
    const records = mockData.harvests.filter((harvest) => harvest.farmId === params.farmId);
    return HttpResponse.json(records);
  }),

  http.post(route('/harvests'), async ({ request }) => {
    const record = makeHarvest({
      ...(await parseBody<CreateHarvestApiArg['body']>(request)),
      id: nextMockId('harvests'),
    });
    mockData.harvests.push(record);
    return HttpResponse.json(record, { status: 201 });
  }),
  http.get(route('/harvests/:id'), ({ params }) => {
    const record = mockData.harvests.find((item) => item.id === params.id);
    return record ? HttpResponse.json(record) : notFound();
  }),
  http.patch(route('/harvests/:id'), async ({ params, request }) => {
    const record = mockData.harvests.find((item) => item.id === params.id);
    if (!record) return notFound();
    Object.assign(record, await parseBody<UpdateHarvestApiArg['body']>(request));
    return HttpResponse.json(record);
  }),
  http.delete(route('/harvests/:id'), ({ params }) => {
    const index = mockData.harvests.findIndex((item) => item.id === params.id);
    if (index < 0) return notFound();
    mockData.harvests.splice(index, 1);
    mockData.plantedCrops = mockData.plantedCrops.filter(
      (item) => item.harvestId !== params.id,
    );
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(route('/harvests/:harvestId/planted-crops'), ({ params }) => {
    const records = mockData.plantedCrops.filter(
      (plantedCrop) => plantedCrop.harvestId === params.harvestId,
    );
    return HttpResponse.json(records);
  }),

  http.post(route('/planted-crops'), async ({ request }) => {
    const record = makePlantedCrop({
      ...(await parseBody<CreatePlantedCropApiArg['body']>(request)),
      id: nextMockId('plantedCrops'),
    });
    mockData.plantedCrops.push(record);
    return HttpResponse.json(record, { status: 201 });
  }),
  http.get(route('/planted-crops/:id'), ({ params }) => {
    const record = mockData.plantedCrops.find((item) => item.id === params.id);
    return record ? HttpResponse.json(record) : notFound();
  }),
  http.patch(route('/planted-crops/:id'), async ({ params, request }) => {
    const record = mockData.plantedCrops.find((item) => item.id === params.id);
    if (!record) return notFound();
    Object.assign(record, await parseBody<UpdatePlantedCropApiArg['body']>(request));
    return HttpResponse.json(record);
  }),
  http.delete(route('/planted-crops/:id'), ({ params }) => {
    const index = mockData.plantedCrops.findIndex((item) => item.id === params.id);
    if (index < 0) return notFound();
    mockData.plantedCrops.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
