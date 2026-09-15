import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';

import { api } from './api.generated';
import { server } from '../../tests/mocks/server';
import { apiStore } from './store';

describe('MSW API integration', () => {
  it('should be able to fetch producers through an RTK Query endpoint', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.listProducers.initiate({ page: 1, perPage: 10 }),
    ).unwrap();

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Ada Rural');
  });

  it('should be able to execute a producer mutation through an RTK Query endpoint', async () => {
    const result = await apiStore.dispatch(
      api.endpoints.createProducer.initiate({
        body: { name: 'New Producer', document: '52998224725' },
      }),
    ).unwrap();

    expect(result.name).toBe('New Producer');
    expect(result.document).toBe('52998224725');
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
      api.endpoints.listProducers.initiate({ name: 'New Producer' }),
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
