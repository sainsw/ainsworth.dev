#!/usr/bin/env node
// Runs the Playwright suite against the throwaway counter in compose.yaml, so
// the view-count specs exercise a working counter instead of skipping.
//
//   npm run e2e:local
//   npm run e2e:local -- --project=api
//   npm run e2e:local -- --build --project=visual
//   npm run e2e:local -- --project=chromium e2e/blog.spec.ts
//
// Everything after `--` goes to `playwright test`, except `--build`. Tear the
// database down afterwards with `npm run db:down`; leaving it up is harmless.
import { spawnSync } from 'node:child_process';

// The one place this URL is written. compose.yaml publishes 5433 on the host.
const DATABASE_URL = 'postgres://postgres:postgres@localhost:5433/views_test';

const argv = process.argv.slice(2);
const build = argv.includes('--build');
const playwrightArgs = argv.filter((arg) => arg !== '--build');

const projects = playwrightArgs
  .filter((arg) => arg.startsWith('--project='))
  .map((arg) => arg.slice('--project='.length));
// No --project at all means every project, which includes visual.
const runsVisual = projects.length === 0 || projects.includes('visual');

if (runsVisual && !build) {
  console.error(
    'The visual baselines were captured against a production build, and the\n' +
      'dev server does not render the same pixels — running them against it\n' +
      'reports failures that are not real.\n\n' +
      'Add --build:\n\n' +
      '  npm run e2e:local -- --build\n',
  );
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL };

function run(command, args, options = {}) {
  const { status, error } = spawnSync(command, args, {
    stdio: 'inherit',
    ...options,
  });
  if (error?.code === 'ENOENT') {
    return 127;
  }
  return status ?? 1;
}

if (spawnSync('docker', ['compose', 'version'], { stdio: 'ignore' }).status) {
  console.error(
    'docker compose is not available.\n\n' +
      'Install Docker Desktop or colima, or run `npm run e2e` instead: without\n' +
      'a counter the view-count specs skip and the specs asserting the\n' +
      'unavailable path run in their place.',
  );
  process.exit(1);
}

const steps = [
  ['docker', ['compose', 'up', '-d', '--wait'], {}],
  ['node', ['./scripts/init-view-counter.mjs'], { env }],
];

if (build) {
  // The build has to see DATABASE_URL, not just the test run. Cache Components
  // prerenders the blog shells at build time, so a build with no counter bakes
  // "unavailable" into the HTML and every count is missing however healthy the
  // database is by the time Playwright asks.
  steps.push(['npm', ['run', 'build-only'], { env: { ...env, SKIP_CV: '1' } }]);
}

for (const [command, args, options] of steps) {
  const status = run(command, args, options);
  if (status !== 0) {
    process.exit(status);
  }
}

process.exit(
  run('npx', ['playwright', 'test', ...playwrightArgs], {
    env: build ? { ...env, PLAYWRIGHT_WEB_COMMAND: 'npx next start' } : env,
  }),
);
