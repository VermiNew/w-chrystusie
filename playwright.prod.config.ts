import { defineConfig, devices } from '@playwright/test'

// Tests against the production build: the service worker (offline mode),
// generated static pages and metadata only exist there.
// Run `npm run build` first, then `npm run test:prod`.
export default defineConfig({
  testDir: './tests/prod',
  outputDir: '.work/playwright-prod-results',
  reporter: [['html', { outputFolder: '.work/playwright-prod-report', open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host localhost --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
