import { defineConfig } from '@playwright/test';
import path from 'node:path';

const E2E_DB = path.resolve(__dirname, 'data/abs_database.e2e.json');

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  globalSetup: './tests/e2e/global-setup.ts',
  webServer: {
    command: 'node .next/standalone/server.js',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ABS_DB_PATH: E2E_DB,
      PORT: '3000',
    },
  },
});