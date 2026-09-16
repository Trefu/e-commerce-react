// Remap every external product image URL inside src/data/products.js to a
// deterministic /products/<local-filename> path. Cycles through the images
// currently living in public/products/ so every entry in the catalog resolves
// locally.
//
// Idempotent: re-running keeps the file in a stable state (the cycling index
// is based on the order of occurrence, not the URL itself, so re-running is
// safe but will reshuffle which image each entry gets).
//
//   node scripts/use-local-products.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PRODUCTS_JS = join(ROOT, 'src', 'data', 'products.js')
const PRODUCTS_DIR = join(ROOT, 'public', 'products')

const localFiles = readdirSync(PRODUCTS_DIR)
  .filter((f) => /\.(png|webp|jpg|jpeg)$/i.test(f))
  .sort()

if (localFiles.length === 0) {
  console.error(`No images found in ${PRODUCTS_DIR}`)
  process.exit(1)
}

const LOCAL_PATHS = localFiles.map((f) => `/products/${f}`)
console.log(`Found ${localFiles.length} local images in public/products/`)

const EXTERNAL_RE = /https:\/\/acdn-us\.mitiendanube\.com\/[^\s"]+/g

const src = readFileSync(PRODUCTS_JS, 'utf-8')

let externalIdx = 0
let replaced = 0
const next = src.replace(EXTERNAL_RE, () => {
  const local = LOCAL_PATHS[externalIdx % LOCAL_PATHS.length]
  externalIdx++
  replaced++
  return local
})

if (externalIdx === 0) {
  console.log('No external image URLs found — products.js already uses local paths.')
} else {
  writeFileSync(PRODUCTS_JS, next, 'utf-8')
  console.log(`Replaced ${replaced} external URL(s) → cycling across ${LOCAL_PATHS.length} local image(s).`)
  console.log(`  Each local image will back ~${Math.ceil(replaced / LOCAL_PATHS.length)} product(s).`)
}