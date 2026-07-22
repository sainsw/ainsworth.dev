import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === '1';

// Specs under e2e/api/ assert HTTP contracts (status, headers, body) through the
// `request` fixture and never open a page. Running them once is enough — the
// browser engine cannot change a response — so they get their own project and
// are excluded from the five browser projects below.
const apiTests = /e2e\/api\//;

// Screenshot baselines are per-engine and per-platform, so running them on all
// five projects would mean five times the committed PNGs for no extra signal —
// a layout regression shows up in one engine as readily as in five. They get a
// single project pinned to Desktop Chrome.
const visualTests = /e2e\/visual\//;

const browserProject = (name: string, device: (typeof devices)[string]) => ({
  name,
  use: { ...device },
  testIgnore: [apiTests, visualTests],
});

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  // `next dev` compiles routes on demand and occasionally loses a manifest race
  // when the suite hits many cold routes at once ("Manifest file is empty").
  // A production build has no such race, so this only absorbs local dev noise.
  retries: process.env.CI ? 2 : 1,
  // Mermaid pulls a large chunk on demand; 30s leaves no headroom for that on a
  // cold dev-server route.
  timeout: 60_000,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  expect: {
    toHaveScreenshot: {
      // Measured at 0 diff over 24 repeat runs on one platform, so this only
      // needs to absorb anti-aliasing noise. Kept deliberately tight: these
      // pages are mostly background, so even halving the content column width
      // only moves ~2% of pixels — a looser bar would sleep through real
      // regressions. Cross-platform rendering differences are handled by
      // separate -darwin / -linux baselines, not by this tolerance.
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
      scale: 'css',
    },
  },
  webServer: skipWebServer
    ? undefined
    : {
        command: process.env.PLAYWRIGHT_WEB_COMMAND || 'npm run dev',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [
    { name: 'api', testMatch: apiTests },
    {
      name: 'visual',
      testMatch: visualTests,
      use: { ...devices['Desktop Chrome'] },
      // A screenshot diff is a real failure, not a flake to be retried away.
      retries: 0,
    },
    browserProject('chromium', devices['Desktop Chrome']),
    browserProject('firefox', devices['Desktop Firefox']),
    browserProject('webkit', devices['Desktop Safari']),
    browserProject('mobile-chrome', devices['Pixel 7']),
    browserProject('mobile-safari', devices['iPhone 15']),
  ],
});
