import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const brasilApi = createApi({
  reducerPath: 'brasilApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BRASIL_API_BASE_URL || 'https://brasilapi.com.br/api',
  }),
  endpoints: () => ({}),
});
