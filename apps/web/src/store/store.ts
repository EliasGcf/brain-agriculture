import { configureStore } from '@reduxjs/toolkit';

import { api } from './api.generated';

export const apiStore = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof apiStore.getState>;
export type AppDispatch = typeof apiStore.dispatch;
