import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { extractMarkdownLinks, findBrokenMarkdownLinks } from '../lib/markdown-links.mjs'

test('extractMarkdownLinks ignores external URLs, image links, and anchors', () => {
  const links = extractMarkdownLinks(`
[local](./page.md)
![image](./image.png)
[external](https://example.com)
[anchor](#section)
`)
  assert.deepEqual(links, ['./page.md'])
})

test('findBrokenMarkdownLinks resolves extensionless markdown pages and index pages', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'pto-wiki-links-'))
  fs.mkdirSync(path.join(temp, 'docs', 'child'), { recursive: true })
  fs.writeFileSync(path.join(temp, 'docs', 'index.md'), '[ok](./child)\n[bad](./missing)\n')
  fs.writeFileSync(path.join(temp, 'docs', 'child', 'index.md'), '# Child\n')

  const previous = process.cwd()
  process.chdir(temp)
  try {
    const broken = findBrokenMarkdownLinks([path.join(temp, 'docs', 'index.md')])
    assert.equal(broken.length, 1)
    assert.equal(broken[0].link, './missing')
  } finally {
    process.chdir(previous)
  }
})
