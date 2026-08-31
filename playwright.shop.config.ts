import { defineConfig } from '@playwright/test';

/**
 * Dev-server E2E config for tests/e2e/shop-supabase.spec.ts only.
 * Runs against `npm run dev` (which auto-loads .env.local for Supabase),
 * so it deliberately has NO webServer and NO globalSetup.
 * Invoke with: npx playwright test --config=playwright.shop.config.ts
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'shop-supabase.spec.ts',
  timeout: 300_000,
  retries: 0,
  workers: 1,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
});