import { env } from "@env";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const brasilApi = createApi({
  reducerPath: 'brasilApi',
  baseQuery: fetchBaseQuery({ baseUrl: env.VITE_BRASIL_API_BASE_URL }),
  endpoints: () => ({}),
});
