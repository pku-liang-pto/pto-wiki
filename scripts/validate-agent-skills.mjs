import path from 'node:path'
import { readText, repoPath, toPosix, walkFiles } from './lib/files.mjs'

function parseFrontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text)
  if (!match) return null

  const data = {}
  for (const line of match[1].split('\n')) {
    const item = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (item) data[item[1]] = item[2].replace(/^['"]|['"]$/g, '').trim()
  }
  return data
}

function validateSkill(file) {
  const text = readText(file)
  const frontmatter = parseFrontmatter(text)
  const errors = []
  const folderName = path.basename(path.dirname(file))

  if (!frontmatter) return ['missing YAML frontmatter']
  if (!frontmatter.name) errors.push('missing frontmatter name')
  if (!frontmatter.description) errors.push('missing frontmatter description')
  if (frontmatter.name && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(frontmatter.name)) {
    errors.push(`name must be kebab-case: ${frontmatter.name}`)
  }
  if (frontmatter.name && frontmatter.name !== folderName) {
    errors.push(`name must match folder: ${frontmatter.name} != ${folderName}`)
  }
  if (frontmatter.description && !frontmatter.description.includes('Use when ')) {
    errors.push('description must include a "Use when " trigger')
  }
  return errors
}

const skillFiles = walkFiles(repoPath('.agents', 'skills'), (file) => path.basename(file) === 'SKILL.md')
const failures = []

for (const file of skillFiles) {
  const errors = validateSkill(file)
  if (errors.length) failures.push({ file: toPosix(path.relative(process.cwd(), file)), errors })
}

if (failures.length) {
  console.error('Agent skill validation failed:')
  for (const failure of failures) {
    console.error(`\n${failure.file}`)
    for (const error of failure.errors) console.error(`  - ${error}`)
  }
  process.exit(1)
}

console.log(`Validated ${skillFiles.length} agent skills.`)
