import fs from 'node:fs'
import path from 'node:path'

export function repoPath(...parts) {
  return path.resolve(process.cwd(), ...parts)
}

export function pathExists(filePath) {
  try {
    fs.accessSync(filePath)
    return true
  } catch {
    return false
  }
}

export function walkFiles(root, predicate = () => true) {
  const absoluteRoot = path.resolve(root)
  if (!pathExists(absoluteRoot)) return []

  const result = []
  const entries = fs.readdirSync(absoluteRoot, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.vitepress') continue

    const absolute = path.join(absoluteRoot, entry.name)
    if (entry.isDirectory()) {
      result.push(...walkFiles(absolute, predicate))
    } else if (entry.isFile() && predicate(absolute)) {
      result.push(absolute)
    }
  }
  return result.sort()
}

export function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8')
}

export function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/')
}
