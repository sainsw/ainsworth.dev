#!/usr/bin/env node
const { spawn } = require('node:child_process')

// Resolve base URL from environment
// Priority: explicit E2E_BASE_URL -> PLAYWRIGHT_BASE_URL -> VERCEL_URL -> default
const raw = process.env.E2E_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000'
const baseURL = raw.startsWith('http') ? raw : `https://${raw}`

// Log environment for debug in CI
console.log('[E2E] VERCEL_ENV =', process.env.VERCEL_ENV || '(unset)')
console.log('[E2E] VERCEL_URL =', process.env.VERCEL_URL || '(unset)')
console.log('[E2E] Resolved PLAYWRIGHT_BASE_URL =', baseURL)

// When pointing to Vercel preview/prod, skip launching a local dev server
const env = {
  ...process.env,
  PLAYWRIGHT_BASE_URL: baseURL,
  PLAYWRIGHT_SKIP_WEBSERVER: baseURL.includes('localhost') ? undefined : '1',
}

const child = spawn('npx', ['playwright', 'test'], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
})

child.on('exit', (code) => process.exit(code ?? 1))

