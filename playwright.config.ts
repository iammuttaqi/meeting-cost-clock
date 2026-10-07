import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:4317';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'laptop',
      use: {
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'phone',
      use: {
        ...devices['iPhone 14'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  ...(!process.env.BASE_URL
    ? {
        webServer: {
          command: 'node ./node_modules/vite/bin/vite.js preview --port 4317',
          url: 'http://localhost:4317',
          reuseExistingServer: false,
          timeout: 120_000,
        },
      }
    : {}),
});
