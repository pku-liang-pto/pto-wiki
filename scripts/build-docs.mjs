import { spawnSync } from 'node:child_process'

const base = process.argv[2]
const env = { ...process.env }
if (base) env.VITEPRESS_BASE = base

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const result = spawnSync(command, ['vitepress', 'build', 'wiki'], {
  env,
  stdio: 'inherit'
})

process.exit(result.status ?? 1)
