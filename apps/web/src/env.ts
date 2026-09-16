import z from 'zod';

export const env = z
  .object({
    DEV: z.boolean(),
    PROD: z.boolean(),

    VITE_API_BASE_URL: z.url(),
    VITE_ENABLE_MSW: z.enum(['true', 'false']).transform((value) => value === 'true'),
    VITE_BRASIL_API_BASE_URL: z.url().optional().default('https://brasilapi.com.br/api'),
  })
  .parse(import.meta.env);
