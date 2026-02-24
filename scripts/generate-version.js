#!/usr/bin/env node
// Runs before every build (see package.json "build" script).
// Generates public/version.json so the client can fetch it with cache-busting
// and reliably detect deployments without relying on volatile server start times.

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const pkg = require('../package.json')

let commitSha = 'unknown'
try {
  commitSha = execSync('git rev-parse --short HEAD', { stdio: ['pipe', 'pipe', 'ignore'] })
    .toString()
    .trim()
} catch {
  // Not a git repo or git not available (e.g. some CI environments)
}

const payload = {
  version: pkg.version,
  commitSha,
  builtAt: new Date().toISOString(),
}

const dest = path.join(__dirname, '..', 'public', 'version.json')
fs.writeFileSync(dest, JSON.stringify(payload, null, 2) + '\n')
console.log('[generate-version] Written', dest, '→', JSON.stringify(payload))
