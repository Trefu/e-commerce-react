// Remove every element that uses the `.streak` / `hero-streak-*` /
// `hero-main-streak` class from .vue files. Safely skips entire elements
// (including any nested content) by tracking HTML/Vue tag depth from the
// matching opening tag to its closing tag.
//
//   node scripts/use-no-streak-vue.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

async function walk(dir) {
  const out = []
  let entries
  try { entries = await readdir(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) out.push(...await walk(full))
    else if (e.name.endsWith('.vue')) out.push(full)
  }
  return out
}

const vueFiles = await walk(join(ROOT, 'src'))

// Tokenizer: scans the template source and yields tags with their byte ranges.
function* scanTags(src) {
  const re = /<(\/?)([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/gs
  let m
  while ((m = re.exec(src)) !== null) {
    const isClose = m[1] === '/'
    const tag = m[2]
    const attrs = m[3] || ''
    const selfClose = m[4] === '/'
    yield {
      index: m.index,
      length: m[0].length,
      text: m[0],
      isClose,
      tag,
      attrs,
      selfClose
    }
  }
}

function classListOf(attrs) {
  const m = attrs.match(/\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/)
  return m ? (m[1] ?? m[2] ?? '') : ''
}

function hasStreakClass(cls) {
  // Match "streak" as a whole token (so "stadium" / "streaks" / etc don't).
  return /(?:^|\s)streak(?:\s|$)/i.test(cls)
}

let touchedFiles = 0
let touchedBytes = 0

for (const file of vueFiles) {
  const src = readFileSync(file, 'utf-8')
  const tags = [...scanTags(src)]
  // Find streak opening tags (not self-closing, not closing).
  const drops = []
  const stack = []
  for (const t of tags) {
    if (t.isClose) {
      stack.pop()
      continue
    }
    if (t.selfClose) continue
    const cls = classListOf(t.attrs)
    if (hasStreakClass(cls)) {
      // Find matching close — need to push a sentinel and wait for depth.
      const idx = stack.length
      stack.push({ tag: t.tag, openIndex: t.index })
      // Walk forward from after this tag to find its closing
      let depth = 1
      const start = t.index + t.length
      // Continue scanning from current position
      const subRe = /<(\/?)([a-zA-Z][\w-]*)\b([^>]*?)(\/?)>/gs
      subRe.lastIndex = start
      let m
      while ((m = subRe.exec(src)) !== null) {
        const isC = m[1] === '/'
        const tag = m[2]
        const selfC = m[4] === '/'
        if (isC) {
          depth--
          if (depth === 0) {
            drops.push({ start: t.index, end: m.index + m[0].length, tag: t.tag })
            stack.pop()
            break
          }
        } else if (!selfC) {
          // Vue treats unknown tags as components (not stack-pushing here)
          // but if the tag matches the open tag, it's a child.
          depth++
        }
      }
    }
  }

  if (drops.length === 0) continue

  // Apply drops from end to start to preserve byte offsets
  let next = src
  for (let i = drops.length - 1; i >= 0; i--) {
    const { start, end } = drops[i]
    next = next.slice(0, start) + next.slice(end)
  }
  writeFileSync(file, next, 'utf-8')
  touchedFiles++
  touchedBytes += src.length - next.length
  console.log(`  ✓ ${file.replace(ROOT, '')} (-${src.length - next.length} bytes)`)
}

console.log(`\nRemoved ${touchedBytes} byte(s) across ${touchedFiles} file(s).`)
