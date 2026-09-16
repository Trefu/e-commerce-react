// Dedupe the PRODUCTS array in src/data/products.js so every entry uses a
// unique /products/* image. Keeps the first product encountered for each
// image filename, drops the rest.
//
//   node scripts/use-local-products-dedupe.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PRODUCTS_JS = join(ROOT, 'src', 'data', 'products.js')

const { PRODUCTS } = await import('../src/data/products.js')

const seen = new Set()
const unique = []
let dropped = 0
for (const p of PRODUCTS) {
  const img = p.image || (Array.isArray(p.images) && p.images[0])
  if (!img || seen.has(img)) {
    dropped++
    continue
  }
  seen.add(img)
  unique.push(p)
}

console.log(`Kept ${unique.length} unique-product(s), dropped ${dropped} duplicate(s).`)
console.log(`Unique images in use: ${seen.size}`)

const src = readFileSync(PRODUCTS_JS, 'utf-8')
const newBlock = `export const PRODUCTS = ${JSON.stringify(unique, null, 2)}\n`
const re = /export const PRODUCTS\s*=\s*\[[\s\S]*?\n\]\s*\n/
const next = src.match(re) ? src.replace(re, newBlock) : `${src}\n${newBlock}`
writeFileSync(PRODUCTS_JS, next, 'utf-8')
console.log('products.js rewritten.')