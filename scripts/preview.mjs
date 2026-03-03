#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const argv = process.argv.slice(2)
let enableHttps = false
const passthroughArgs = []

for (const arg of argv) {
  if (arg === '--https') {
    enableHttps = true
    continue
  }
  passthroughArgs.push(arg)
}

const env = {
  ...process.env,
}

if (enableHttps && !env.MCP_HTTPS) {
  env.MCP_HTTPS = 'true'
}

const viteCli = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))

const child = spawn(process.execPath, [viteCli, 'preview', ...passthroughArgs], {
  stdio: 'inherit',
  env,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 0)
})
