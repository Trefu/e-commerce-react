// Replace every /beyblades/* asset reference in src/ with a deterministic
// /products/<local-filename> path. Cycles through the images living in
// public/products/ so each broken reference becomes a real local file.
//
//   node scripts/use-local-assets.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PRODUCTS_DIR = join(ROOT, 'public', 'products')

const localFiles = readdirSync(PRODUCTS_DIR)
  .filter((f) => /\.(png|webp|jpg|jpeg|svg)$/i.test(f))
  .sort()

if (localFiles.length === 0) {
  console.error(`No images found in ${PRODUCTS_DIR}`)
  process.exit(1)
}

const pick = (i) => `/products/${localFiles[i % localFiles.length]}`

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
    else if (/\.(vue|js|ts|css)$/i.test(e.name)) out.push(full)
  }
  return out
}

const files = (await Promise.all(SRC_GLOBS.map(walk))).flat()
console.log(`Scanning ${files.length} files in src/ for /beyblades/* references…`)

const BEY_RE = /['"`]\/beyblades\/[^'"`]+['"`]/g

let totalFiles = 0
let totalRefs = 0
let counter = 0

for (const file of files) {
  const src = readFileSync(file, 'utf-8')
  if (!BEY_RE.test(src)) {
    BEY_RE.lastIndex = 0
    continue
  }
  BEY_RE.lastIndex = 0
  const next = src.replace(BEY_RE, () => {
    const replacement = pick(counter++)
    totalRefs++
    return `'${replacement}'`
  })
  writeFileSync(file, next, 'utf-8')
  totalFiles++
  console.log(`  ✓ ${file.replace(ROOT + '\\', '').replace(ROOT + '/', '')}`)
}

if (totalRefs === 0) {
  console.log('No /beyblades/* references found.')
} else {
  console.log(`\nReplaced ${totalRefs} reference(s) across ${totalFiles} file(s) using ${localFiles.length} local image(s).`)
}