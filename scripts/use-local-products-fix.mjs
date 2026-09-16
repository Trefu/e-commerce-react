// Find every /products/<file> reference in src/ whose file is NOT present in
// public/products/ and remap it to a deterministic cycling entry from the
// files that DO exist. Runs after use-local-products.mjs to clean up the
// pre-existing "stale" local paths that the scraper wrote but never
// downloaded/processed.
//
//   node scripts/use-local-products.mjs   (run first)
//   node scripts/use-local-products-fix.mjs
//
// Idempotent: once all references resolve to existing files, the script
// becomes a no-op.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PRODUCTS_DIR = join(ROOT, 'public', 'products')

const existing = new Set(
  readdirSync(PRODUCTS_DIR).filter((f) => /\.(png|webp|jpg|jpeg|svg)$/i.test(f))
)
const localFiles = [...existing].sort()
if (localFiles.length === 0) {
  console.error(`No images found in ${PRODUCTS_DIR}`)
  process.exit(1)
}

const LOCAL_PATHS = localFiles.map((f) => `/products/${f}`)
const pick = (i) => LOCAL_PATHS[i % LOCAL_PATHS.length]

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

const files = (await Promise.all(SRC_GLOBS.map(walk))).flat()
console.log(`Scanning ${files.length} files for stale /products/* references…`)

const REF_RE = /\/products\/[a-z0-9_-]+(?:\.[a-z]+)+/gi

let totalFiles = 0
let totalRefs = 0
let missingUnique = new Set()
let counter = 0

for (const file of files) {
  const src = readFileSync(file, 'utf-8')
  REF_RE.lastIndex = 0
  if (!REF_RE.test(src)) continue
  REF_RE.lastIndex = 0
  let fileChanged = false
  const next = src.replace(REF_RE, (ref) => {
    const fname = ref.replace(/^\/products\//, '')
    if (existing.has(fname)) return ref // already valid
    missingUnique.add(fname)
    fileChanged = true
    totalRefs++
    return pick(counter++)
  })
  if (fileChanged) {
    writeFileSync(file, next, 'utf-8')
    totalFiles++
    console.log(`  ✓ ${file.replace(ROOT, '')}`)
  }
}

if (totalRefs === 0) {
  console.log('All /products/* references already resolve to existing files.')
} else {
  console.log(`\nReplaced ${totalRefs} stale reference(s) across ${totalFiles} file(s).`)
  console.log(`Missing filenames encountered (${missingUnique.size} unique):`)
  for (const m of [...missingUnique].sort()) console.log(`  - ${m}`)
  console.log(`\nMapped onto ${LOCAL_PATHS.length} existing image(s).`)
}