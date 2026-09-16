import { z } from 'zod';

export const EnvSchema = z
  .object({
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string().min(1),
    PORT: z.coerce.number().optional().default(3333),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .optional()
      .default('development'),
    ALLOWED_ORIGIN: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === 'production') return !!data.ALLOWED_ORIGIN;
      return true;
    },
    {
      error: 'ALLOWED_ORIGIN is required in production',
      path: ['ALLOWED_ORIGIN'],
    },
  );

export type Env = z.infer<typeof EnvSchema>;
