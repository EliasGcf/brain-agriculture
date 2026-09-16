import { configureStore } from '@reduxjs/toolkit';

import { api } from './api/api.generated';
import { brasilApi } from './brasil-api/api.generated';

export const apiStore = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    [brasilApi.reducerPath]: brasilApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware, brasilApi.middleware),
});

export type RootState = ReturnType<typeof apiStore.getState>;
export type AppDispatch = typeof apiStore.dispatch;
