import { defineConfig, devices } from '@playwright/test';

const PORT = 5175;
// Uses the locally installed Google Chrome by default; set PW_CHANNEL="" to use Playwright's bundled Chromium
const channel = process.env.PW_CHANNEL ?? 'chrome';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: channel || undefined,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel: channel || undefined, viewport: { width: 1440, height: 900 } },
      testIgnore: /mobile\.spec\.js/
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], channel: channel || undefined },
      testMatch: /mobile\.spec\.js/
    }
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
});
