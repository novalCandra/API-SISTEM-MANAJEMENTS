import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      DB_DRIVER: 'memory',
      STORAGE_DRIVER: 'local',
      JWT_ACCESS_SECRET: 'test-access-secret-at-least-32-bytes-long!!',
      JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-bytes-long!',
    },
  },
});
