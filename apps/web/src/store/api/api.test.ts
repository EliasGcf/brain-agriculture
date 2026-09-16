import { http, HttpResponse } from 'msw';

import { api } from './api.generated';
import { server } from '../../../tests/mocks/server';
import { apiStore } from '../store';

describe('MSW API integration', () => {
  it('should be able to fetch producers through an RTK Query endpoint', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.listProducers.initiate({ page: 1, perPage: 10 }),
    ).unwrap();

    expect(result.items).toHaveLength(3);
    expect(result.total).toBe(3);
    expect(result.items[0].document).toEqual({
      type: 'cpf',
      value: '52998224725',
      formatted: '529.982.247-25',
    });
    expect(result.items.map((item) => item.name)).toEqual([
      'Ada Rural',
      'Bruno Rural',
      'Cora Rural',
    ]);
  });

  it('should be able to paginate producers in deterministic order', async () => {
    const firstPage = await apiStore.dispatch(
      api.endpoints.listProducers.initiate({ page: 1, perPage: 2 }),
    ).unwrap();
    const secondPage = await apiStore.dispatch(
      api.endpoints.listProducers.initiate({ page: 2, perPage: 2 }),
    ).unwrap();

    expect(firstPage.total).toBe(3);
    expect(firstPage.items.map((item) => item.name)).toEqual([
      'Ada Rural',
      'Bruno Rural',
    ]);
    expect(secondPage.items.map((item) => item.name)).toEqual(['Cora Rural']);
  });

  it('should be able to search producers by name through the unified query', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.listProducers.initiate({ search: 'bruno', page: 1, perPage: 10 }),
    ).unwrap();

    expect(result.items.map((item) => item.name)).toEqual(['Bruno Rural']);
  });

  it('should be able to search producers by formatted document through the unified query', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.listProducers.initiate({
        search: '390.533.447-05',
        page: 1,
        perPage: 10,
      }),
    ).unwrap();

    expect(result.items.map((item) => item.name)).toEqual(['Bruno Rural']);
  });

  it('should be able to list farms by producer through an RTK Query endpoint', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.listFarmsByProducer.initiate({
        producerId: '00000000-0000-4000-8000-000000000001',
      }),
    ).unwrap();

    expect(result[0]).toMatchObject({
      producerId: '00000000-0000-4000-8000-000000000001',
    });
  });

  it('should be able to list an empty relationship collection for an unknown parent', async () => {
    await expect(
      apiStore.dispatch(
        api.endpoints.listHarvestsByFarm.initiate({
          farmId: '00000000-0000-4000-8000-999999999999',
        }),
      ).unwrap(),
    ).resolves.toEqual([]);
  });

  it('should be able to list planted crops by harvest through an RTK Query endpoint', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.listPlantedCropsByHarvest.initiate({
        harvestId: '00000000-0000-4000-8000-000000000003',
      }),
    ).unwrap();

    expect(result[0]).toMatchObject({
      harvestId: '00000000-0000-4000-8000-000000000003',
    });
  });

  it('should not be able to delete a producer that has farms', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.deleteProducer.initiate({
        id: '00000000-0000-4000-8000-000000000001',
      }),
    );

    expect(result).toMatchObject({ error: { status: 403 } });
  });

  it('should be able to delete a producer without farms', async () => {
    const producer = await apiStore.dispatch(
      api.endpoints.createProducer.initiate({
        body: { name: 'Producer Without Farms', document: '39053344705' },
      }),
    ).unwrap();

    await expect(
      apiStore.dispatch(api.endpoints.deleteProducer.initiate({ id: producer.id })).unwrap(),
    ).resolves.toBeNull();

    await expect(
      apiStore.dispatch(api.endpoints.getProducerById.initiate({ id: producer.id })).unwrap(),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('should not be able to delete a missing producer', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.deleteProducer.initiate({
        id: '00000000-0000-4000-8000-999999999999',
      }),
    );

    expect(result).toMatchObject({ error: { status: 404 } });
  });

  it('should calculate producer farmsCount from the farm collection', async () => {
    const initial = await apiStore.dispatch(
      api.endpoints.listProducers.initiate({ page: 1, perPage: 10 }),
    ).unwrap();

    expect(initial.items[0]).toMatchObject({
      id: '00000000-0000-4000-8000-000000000001',
      farmsCount: 1,
    });
    expect(initial.items[1]).toMatchObject({
      id: '00000000-0000-4000-8000-000000000005',
      farmsCount: 0,
    });

    const farm = await apiStore.dispatch(
      api.endpoints.createFarm.initiate({
        body: {
          name: 'Second Ada Farm',
          producerId: '00000000-0000-4000-8000-000000000001',
          city: 'Salvador',
          state: 'BA',
          totalArea: 80,
          arableArea: 40,
          vegetationArea: 20,
        },
      }),
    ).unwrap();

    const afterCreate = await apiStore.dispatch(
      api.endpoints.listProducers.initiate(
        { page: 1, perPage: 10 },
        { forceRefetch: true },
      ),
    ).unwrap();

    expect(afterCreate.items[0]).toMatchObject({ farmsCount: 2 });
    expect(afterCreate.items[1]).toMatchObject({ farmsCount: 0 });

    await apiStore.dispatch(api.endpoints.deleteFarm.initiate({ id: farm.id })).unwrap();

    const afterDelete = await apiStore.dispatch(
      api.endpoints.listProducers.initiate(
        { page: 1, perPage: 10 },
        { forceRefetch: true },
      ),
    ).unwrap();

    expect(afterDelete.items[0]).toMatchObject({ farmsCount: 1 });
    expect(afterDelete.items[1]).toMatchObject({ farmsCount: 0 });
  });

  it('should be able to execute a producer mutation through an RTK Query endpoint', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.createProducer.initiate({
        body: { name: 'New Producer', document: '52998224725' },
      }),
    ).unwrap();

    expect(result.name).toBe('New Producer');
    expect(result.document).toMatchObject({
      type: 'cpf',
      value: '52998224725',
      formatted: '529.982.247-25',
    });
  });

  it('should be able to update a producer with a string request document and nested response document', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.updateProducer.initiate({
        id: '00000000-0000-4000-8000-000000000005',
        body: { name: 'Bruno Atualizado', document: '11.222.333/0001-81' },
      }),
    ).unwrap();

    expect(result.document).toEqual({
      type: 'cnpj',
      value: '11222333000181',
      formatted: '11.222.333/0001-81',
    });
  });

  it('should be able to update a producer without replacing its document', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.updateProducer.initiate({
        id: '00000000-0000-4000-8000-000000000001',
        body: { name: 'Ada Atualizada' },
      }),
    ).unwrap();

    expect(result.name).toBe('Ada Atualizada');
    expect(result.document).toEqual({
      type: 'cpf',
      value: '52998224725',
      formatted: '529.982.247-25',
    });
  });

  it('should not be able to fetch a missing producer', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.getProducerById.initiate({
        id: '00000000-0000-4000-8000-999999999999',
      }),
    );

    expect(result).toMatchObject({ error: { status: 404 } });
  });

  it('should not be able to use stale mock overrides after each test', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.listProducers.initiate({ search: 'New Producer' }),
    ).unwrap();

    expect(result.items).toHaveLength(0);
  });

  it('should be able to override a response for an individual test', async () => {
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
    server.use(
      http.get(`${baseUrl}/producers`, () =>
        HttpResponse.json({ items: [], total: 0 }),
      ),
    );

    const result = await apiStore.dispatch(
      api.endpoints.listProducers.initiate({ page: 1, perPage: 10 }),
    ).unwrap();

    expect(result.items).toHaveLength(0);
  });

  it('should be able to preserve unique mock ids after deleting a record', async () => {
    const body = {
      name: 'Farm',
      producerId: '00000000-0000-4000-8000-000000000001',
      city: 'Salvador',
      state: 'BA',
      totalArea: 100,
      arableArea: 60,
      vegetationArea: 20,
    };
    const first = await apiStore.dispatch(api.endpoints.createFarm.initiate({ body })).unwrap();
    const second = await apiStore.dispatch(api.endpoints.createFarm.initiate({ body })).unwrap();
    await apiStore.dispatch(api.endpoints.deleteFarm.initiate({ id: first.id })).unwrap();
    const third = await apiStore.dispatch(api.endpoints.createFarm.initiate({ body })).unwrap();

    expect(third.id).not.toBe(second.id);
  });

  it('should be able to remove dependent mock records when deleting a farm', async () => {
    await apiStore.dispatch(
      api.endpoints.deleteFarm.initiate({
        id: '00000000-0000-4000-8000-000000000002',
      }),
    ).unwrap();

    const result = await apiStore.dispatch(
      api.endpoints.getHarvestById.initiate({
        id: '00000000-0000-4000-8000-000000000003',
      }),
    );

    expect(result).toMatchObject({ error: { status: 404 } });
  });
});
