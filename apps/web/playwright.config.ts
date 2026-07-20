import { defineConfig, devices } from '@playwright/test';

/**
 * HTML report stays under apps/web/playwright-report (gitignored).
 * Never copy it into public/ or the Pages artifact (deploy uploads apps/web/dist only).
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5175';

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        // Explicit local path — not under public/
        outputFolder: './playwright-report',
      },
    ],
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
