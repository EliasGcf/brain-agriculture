import { z } from 'zod';

export const EnvSchema = z.object({
  DATABASE_URL: z.url(),
  PORT: z.coerce.number().optional().default(3333),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),
});

export type Env = z.infer<typeof EnvSchema>;
