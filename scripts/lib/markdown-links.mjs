import path from 'node:path'
import { pathExists, readText } from './files.mjs'

const MARKDOWN_LINK_RE = /(?<!!)\[[^\]\n]*\]\(([^)\n]+)\)/g

export function extractMarkdownLinks(markdown) {
  const links = []
  for (const match of markdown.matchAll(MARKDOWN_LINK_RE)) {
    const raw = match[1].trim()
    if (!raw || raw.startsWith('#')) continue
    if (/^(https?:|mailto:|tel:|app:\/\/|plugin:\/\/)/.test(raw)) continue
    links.push(raw.replace(/^<|>$/g, ''))
  }
  return links
}

export function candidateTargets(sourceFile, rawTarget) {
  const withoutAnchor = rawTarget.split('#')[0].split('?')[0]
  if (!withoutAnchor) return []

  const decoded = decodeURI(withoutAnchor)
  const base = decoded.startsWith('/')
    ? path.resolve(process.cwd(), decoded.slice(1))
    : path.resolve(path.dirname(sourceFile), decoded)

  const candidates = [base]
  if (!path.extname(base)) {
    candidates.push(`${base}.md`)
    candidates.push(path.join(base, 'index.md'))
  }
  return candidates
}

export function findBrokenMarkdownLinks(files) {
  const broken = []
  for (const file of files) {
    const markdown = readText(file)
    for (const link of extractMarkdownLinks(markdown)) {
      const candidates = candidateTargets(file, link)
      if (!candidates.some(pathExists)) {
        broken.push({ file, link, candidates })
      }
    }
  }
  return broken
}
