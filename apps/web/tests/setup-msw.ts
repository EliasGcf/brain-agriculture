import { afterAll, afterEach, beforeAll } from 'vitest';

import { resetMockData } from './mocks/data';
import { server } from './mocks/server';
import { api } from '../src/store/api/api.generated';
import { apiStore } from '../src/store/store';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  resetMockData();
  apiStore.dispatch(api.util.resetApiState());
});

afterAll(() => server.close());
