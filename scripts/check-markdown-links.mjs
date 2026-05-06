import path from 'node:path'
import { findBrokenMarkdownLinks } from './lib/markdown-links.mjs'
import { pathExists, repoPath, toPosix, walkFiles } from './lib/files.mjs'

const targets = process.argv.slice(2)
const roots = targets.length ? targets : ['AGENTS.md', '.agents', 'wiki']
const files = []

for (const target of roots) {
  const absolute = repoPath(target)
  if (!pathExists(absolute)) {
    console.error(`Missing link-check target: ${target}`)
    process.exit(1)
  }
  if (absolute.endsWith('.md')) {
    files.push(absolute)
  } else {
    files.push(...walkFiles(absolute, (file) => file.endsWith('.md')))
  }
}

const uniqueFiles = [...new Set(files)].sort()
const broken = findBrokenMarkdownLinks(uniqueFiles)

if (broken.length) {
  console.error('Broken local Markdown links:')
  for (const item of broken) {
    console.error(`- ${toPosix(path.relative(process.cwd(), item.file))}: ${item.link}`)
  }
  process.exit(1)
}

console.log(`Checked ${uniqueFiles.length} Markdown files.`)
