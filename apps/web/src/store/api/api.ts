import { env } from "@env";
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: async (...args) => {
    // await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network latency
    return fetchBaseQuery({
      baseUrl: env.VITE_API_BASE_URL,
      credentials: 'include',
    })(...args);
  },
  endpoints: () => ({}),
});
