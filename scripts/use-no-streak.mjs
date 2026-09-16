// Remove every element that uses the `.streak` / `hero-streak-*` /
// `hero-main-streak` class. Also drops the matching CSS rules in
// src/assets/main.css and the scoped style block of HeroBeyblades.vue.
//
//   node scripts/use-no-streak.mjs
//
// Idempotent: a re-run on a clean tree is a no-op.

import { readFileSync, writeFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

async function walk(dir, exts) {
  const out = []
  let entries
  try { entries = await readdir(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) out.push(...await walk(full, exts))
    else if (exts.some(x => e.name.endsWith(x))) out.push(full)
  }
  return out
}

const vueFiles = await walk(join(ROOT, 'src'), ['.vue'])
const cssFiles = await walk(join(ROOT, 'src'), ['.css'])

let touchedFiles = 0
let touchedBytes = 0

// 1. Vue: remove any element whose class attribute contains "streak"
//    (catches .streak, .hero-streak-*, .hero-main-streak). Multiline-safe.
const VUE_RE = /<([a-zA-Z][\w-]*)\b[^>]*\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*\/>|<([a-zA-Z][\w-]*)\b[^>]*\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/\4>/g

function pickClass(m) {
  return m[2] ?? m[3] ?? m[5] ?? m[6] ?? ''
}

for (const file of vueFiles) {
  const src = readFileSync(file, 'utf-8')
  let out = ''
  let last = 0
  let changed = false
  for (const m of src.matchAll(VUE_RE)) {
    const cls = pickClass(m)
    if (!/\bstreak\b/i.test(cls)) continue
    out += src.slice(last, m.index)
    last = m.index + m[0].length
    changed = true
  }
  out += src.slice(last)
  if (changed) {
    writeFileSync(file, out, 'utf-8')
    touchedFiles++
    touchedBytes += src.length - out.length
    console.log(`  ✓ ${file.replace(ROOT, '')}`)
  }
}

// 2. CSS: strip the `.streak`, `.hero-streak`, `.hero-streak-*`,
//    `.hero-main-streak` rules (and their keyframes they introduce).
const cssTargets = [
  /[ \t]*\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/\n?/g, // comment lines (consumed below if adjacent)
]
const STRIP_RE = /\/\* Beyblade streak[\s\S]*?\}\s*\n|\/\* Hero Beyblade[^\n]*\n\.hero-streak\s*\{[\s\S]*?\}\s*\n|\.hero-streak-(red|blue|green|purple)\s*\{[\s\S]*?\}\s*\n|\.hero-main-streak\s*\{[\s\S]*?\}\s*\n/g

for (const file of cssFiles) {
  const src = readFileSync(file, 'utf-8')
  const next = src.replace(STRIP_RE, '')
  if (next !== src) {
    writeFileSync(file, next, 'utf-8')
    touchedFiles++
    touchedBytes += src.length - next.length
    console.log(`  ✓ ${file.replace(ROOT, '')}`)
  }
}

console.log(`\nRemoved ${touchedBytes} byte(s) across ${touchedFiles} file(s).`)
