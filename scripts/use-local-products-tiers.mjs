// Redistribute products across tiers (S/A/B/C) by power rank, so the
// "Ranked by community meta" section on the homepage actually has a
// distribution instead of all beys in tier S.
//
//   node scripts/use-local-products-tiers.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PRODUCTS_JS = join(ROOT, 'src', 'data', 'products.js')

const { PRODUCTS } = await import('../src/data/products.js')

// Sort by power desc, then split into 4 buckets
const sorted = [...PRODUCTS].sort((a, b) => (b.power || 0) - (a.power || 0))
const n = sorted.length
const buckets = {
  S: sorted.slice(0, Math.ceil(n * 0.25)),
  A: sorted.slice(Math.ceil(n * 0.25), Math.ceil(n * 0.5)),
  B: sorted.slice(Math.ceil(n * 0.5), Math.ceil(n * 0.75)),
  C: sorted.slice(Math.ceil(n * 0.75))
}

const tierOf = new Map()
for (const [tier, list] of Object.entries(buckets)) {
  for (const p of list) tierOf.set(p.id, tier)
}

let changed = 0
for (const p of PRODUCTS) {
  const t = tierOf.get(p.id)
  if (t && p.tier !== t) {
    p.tier = t
    changed++
  }
}

const counts = { S: 0, A: 0, B: 0, C: 0 }
for (const p of PRODUCTS) counts[p.tier] = (counts[p.tier] || 0) + 1
console.log(`Reassigned ${changed} tier(s). New distribution:`, counts)

// Persist
const src = readFileSync(PRODUCTS_JS, 'utf-8')
const newBlock = `export const PRODUCTS = ${JSON.stringify(PRODUCTS, null, 2)}\n`
const re = /export const PRODUCTS\s*=\s*\[[\s\S]*?\n\]\s*\n/
const next = src.match(re) ? src.replace(re, newBlock) : `${src}\n${newBlock}`
writeFileSync(PRODUCTS_JS, next, 'utf-8')
console.log('products.js rewritten.')