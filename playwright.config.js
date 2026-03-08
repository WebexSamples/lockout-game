import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Lockout Game E2E tests.
 * Tests require both the backend (port 5000) and frontend (port 5173) to be running.
 *
 * Start servers before running tests:
 *   Backend:  cd /path/to/lockout-game && python -m backend.app
 *   Frontend: cd /path/to/lockout-game/frontend && npm run dev
 *
 * Then run: npx playwright test
 */
export default defineConfig({
  testDir: './e2e',

  // Run tests sequentially — full-game tests use multiple browser contexts
  // that must coordinate, so parallel execution would cause interference.
  fullyParallel: false,
  workers: 1,

  // Retry once on CI to handle flakiness from timing-dependent socket events
  retries: process.env.CI ? 1 : 0,

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.FRONTEND_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
