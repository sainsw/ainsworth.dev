#!/usr/bin/env node
// Runs the Playwright suite against the throwaway counter in compose.yaml, so
// the view-count specs exercise a working counter instead of skipping.
//
//   npm run e2e:local
//   npm run e2e:local -- --project=api
//   npm run e2e:local -- --project=chromium e2e/blog.spec.ts
//
// Everything after `--` is handed to `playwright test`. Tear the database down
// afterwards with `npm run db:down`; leaving it running is harmless.
import { spawnSync } from 'node:child_process';

// The one place this URL is written. compose.yaml publishes 5433 on the host.
const DATABASE_URL = 'postgres://postgres:postgres@localhost:5433/views_test';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.error?.code === 'ENOENT') {
    return { status: 127 };
  }
  return result;
}

if (
  spawnSync('docker', ['compose', 'version'], { stdio: 'ignore' }).status !== 0
) {
  console.error(
    'docker compose is not available.\n\n' +
      'Install Docker Desktop, or run `npm run e2e` instead: without a counter\n' +
      'the view-count specs skip and the specs asserting the unavailable path\n' +
      'run in their place.',
  );
  process.exit(1);
}

const steps = [
  ['docker', ['compose', 'up', '-d', '--wait'], {}],
  [
    'node',
    ['./scripts/init-view-counter.mjs'],
    { env: { ...process.env, DATABASE_URL } },
  ],
];

for (const [command, args, options] of steps) {
  const { status } = run(command, args, options);
  if (status !== 0) {
    process.exit(status ?? 1);
  }
}

const { status } = run(
  'npx',
  ['playwright', 'test', ...process.argv.slice(2)],
  { env: { ...process.env, DATABASE_URL } },
);
process.exit(status ?? 1);
