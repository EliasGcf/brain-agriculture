import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config';

export default defineConfig(({ mode })  => ({
  resolve: {  tsconfigPaths: true },
  test: {
    globals: true,
    isolate: false,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    globalSetup: './test/e2e-global-setup.ts',
    env: loadEnv(mode, process.cwd(), ''),
  },
}));
