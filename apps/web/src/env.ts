import z from 'zod';

const envSchema = z.object({
  DEV: z.boolean(),
  PROD: z.boolean(),

  VITE_API_BASE_URL: z.url(),
  VITE_ENABLE_MSW: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((value) => value === 'true'),
  VITE_BRASIL_API_BASE_URL: z.url().optional().default('https://brasilapi.com.br/api'),
});

const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', z.treeifyError(_env.error));
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
