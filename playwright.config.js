import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Playwright configuration for Lockout Game E2E tests.
 *
 * Both the backend and frontend servers are started automatically via the
 * `webServer` option — no manual server startup required.
 *
 * Run:  npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',

  // Run tests sequentially — full-game tests coordinate across multiple browser
  // contexts and must not interfere with each other.
  fullyParallel: false,
  workers: 1,

  // Retry once on CI to handle flakiness from timing-dependent socket events.
  retries: process.env.CI ? 1 : 0,

  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    baseURL: 'http://localhost:5173',
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

  // Automatically start (and stop) both servers before (and after) the suite.
  webServer: [
    {
      // Flask + SocketIO backend — started via gunicorn with the eventlet worker
      // class to match the production setup and avoid the Werkzeug stat-reloader
      // conflicting with eventlet's event loop (which causes WebSocket connections
      // to stall for minutes when using `python -m backend.app` with debug=True).
      command:
        'gunicorn --bind 0.0.0.0:5000 --workers 1 --worker-class eventlet --timeout 120 "backend.app:app"',
      url: 'http://localhost:5000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        SECRET_KEY: 'playwright-test-secret',
        FRONTEND_URL: 'http://localhost:5173',
        ALLOWED_ORIGINS: 'http://localhost:5173',
      },
    },
    {
      // React + Vite frontend
      command: 'npm run dev',
      cwd: path.join(__dirname, 'frontend'),
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      // Spread process.env first so PATH and other host vars are inherited,
      // then override with Vite-specific values.
      env: {
        ...process.env,
        VITE_API_URL: 'http://localhost:5000/api',
        VITE_SOCKET_URL: 'http://localhost:5000',
      },
    },
  ],
});
