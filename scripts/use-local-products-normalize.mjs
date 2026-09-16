// Normalize accidental double / triple extensions left behind by a buggy
// regex pass (e.g.  img_0092-…webp.png.png  →  img_0092-…webp.png) so every
// /products/* reference resolves to a real file in public/products/.
//
//   node scripts/use-local-products-normalize.mjs
//   node scripts/use-local-products-fix.mjs          (run after this)

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const existing = new Set(
  readdirSync(join(ROOT, 'public', 'products')).filter((f) => /\.(png|webp|jpg|jpeg|svg)$/i.test(f))
)

const SRC_GLOBS = [
  'src/components',
  'src/pages',
  'src/stores',
  'src/router',
  'src/data',
  'src/assets'
]

async function walk(dir) {
  const { readdir } = await import('node:fs/promises')
  const out = []
  let entries
  try { entries = await readdir(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) out.push(...await walk(full))
    else if (/\.(vue|js|ts)$/i.test(e.name)) out.push(full)
  }
  return out
}

// Match any /products/<filename> with one OR MORE dot-segments
const REF_RE = /\/products\/[a-z0-9_-]+(?:\.[a-z]+)+/gi

function collapse(ref) {
  // split off the path → ["img_xxx", "webp", "png", "png"]
  const path = ref.replace(/^\/products\//, '')
  const parts = path.split('.')
  const stem = parts[0]
  let exts = parts.slice(1)
  // Drop duplicates, last wins
  exts = [...new Set(exts)]
  // If a real file exists with this combination, return it.
  while (exts.length > 0) {
    const fname = stem + '.' + exts.join('.')
    if (existing.has(fname)) return '/products/' + fname
    exts.pop()
  }
  // Nothing matched — return the input unchanged so the caller can flag it.
  return ref
}

const files = (await Promise.all(SRC_GLOBS.map(walk))).flat()
let totalFiles = 0
let totalRefs = 0
let unmatched = new Set()

for (const file of files) {
  const src = readFileSync(file, 'utf-8')
  REF_RE.lastIndex = 0
  if (!REF_RE.test(src)) continue
  REF_RE.lastIndex = 0
  let fileChanged = false
  const next = src.replace(REF_RE, (ref) => {
    const fixed = collapse(ref)
    if (fixed === ref) {
      unmatched.add(ref)
      return ref
    }
    fileChanged = true
    totalRefs++
    return fixed
  })
  if (fileChanged) {
    writeFileSync(file, next, 'utf-8')
    totalFiles++
    console.log(`  ✓ ${file.replace(ROOT, '')}`)
  }
}

if (totalRefs === 0) {
  console.log('No double/multi-extension references found.')
} else {
  console.log(`\nNormalized ${totalRefs} path(s) across ${totalFiles} file(s).`)
  if (unmatched.size) {
    console.log(`\nCould not match ${unmatched.size} unique path(s):`)
    for (const u of [...unmatched].sort()) console.log(`  - ${u}`)
  }
}