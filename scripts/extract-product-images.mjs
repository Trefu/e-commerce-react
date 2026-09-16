// Two-step pipeline:
//   1. Download the 480x480 source images into public/products-originals/
//   2. Run local AI background removal on each and write a transparent
//      RGBA PNG into public/products/<slug>.png
//   3. Patch src/data/products.js so the matching products reference the
//      local /products/<slug>.png paths.
//
// Idempotent: re-running skips both steps for files that already exist.
//
//   node scripts/extract-product-images.mjs           # full pipeline
//   node scripts/extract-product-images.mjs --no-dl   # only re-process existing
//
// The first run downloads the ~170MB ISNet model into the package cache.
// Subsequent runs reuse it.

import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname, basename } from 'node:path'
import { execSync } from 'node:child_process'
import { removeBackground } from '@imgly/background-removal-node'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PRODUCTS_JS = join(ROOT, 'src', 'data', 'products.js')
const ORIGINALS_DIR = join(ROOT, 'public', 'products-originals')
const PROCESSED_DIR = join(ROOT, 'public', 'products')

mkdirSync(ORIGINALS_DIR, { recursive: true })
mkdirSync(PROCESSED_DIR, { recursive: true })

const ARGS = new Set(process.argv.slice(2))
const SKIP_DOWNLOAD = ARGS.has('--no-dl')
const ONLY_DOWNLOAD = ARGS.has('--dl-only')

// ---------- pick featured products ----------
const { PRODUCTS } = await import('../src/data/products.js')

const FEATURED_BADGES = new Set(['Hot', 'Bestseller', 'Legendary', 'New'])

function pickFeatured(all, limit = 50) {
  const scored = all.map((p) => {
    let score = 0
    if (p.inStock) score += 50
    if (p.tier === 'S') score += 30
    else if (p.tier === 'A') score += 15
    else if (p.tier === 'B') score += 5
    if (p.badge && FEATURED_BADGES.has(p.badge)) score += 12
    score -= Math.min(20, Math.floor(p.price / 2000))
    return { p, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((x) => x.p)
}

const targets = pickFeatured(PRODUCTS, 50)
console.log(`Picked ${targets.length} featured products.`)

// ---------- helpers ----------
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const isRemoteUrl = (u) => typeof u === 'string' && /^https?:\/\//i.test(u)

function urlToSlug(url) {
  if (!isRemoteUrl(url)) {
    // already a local /products/<slug>.png — slug is the basename minus ext
    return basename(url).replace(/\.[a-z]+$/i, '')
  }
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    const i = parts.indexOf('productos')
    if (i >= 0 && parts[i + 1]) return parts[i + 1].replace(/\/$/, '')
    const fname = parts[parts.length - 1] || ''
    return fname.replace(/-\d+-\d+(\.[a-z]+)$/i, '$1').slice(0, 80)
  } catch {
    return 'product-' + Math.random().toString(36).slice(2, 8)
  }
}

function bumpSize(url, size = 480) {
  return url.replace(/-\d+-\d+(\.[a-z]+)$/i, `-${size}-${size}$1`)
}

function extFor(url) {
  if (!isRemoteUrl(url)) return '.webp'
  const e = extname(new URL(url).pathname).toLowerCase()
  if (e === '.webp' || e === '.jpg' || e === '.jpeg' || e === '.png') return e
  return '.webp'
}

async function downloadBytes(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'es-MX,es;q=0.9' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

// Use sharp if available to write a guaranteed-RGBA PNG. Falls back to a
// Node-side palette-to-RGBA conversion using PNG decoding if sharp is
// missing (which it is in this minimal project).
async function writeRgbaPng(inputBytes, outPath) {
  const mime = 'image/png'
  const blob = new Blob([inputBytes], { type: mime })
  const outBlob = await removeBackground(blob)
  const outBytes = Buffer.from(await outBlob.arrayBuffer())

  // Try sharp first (if user adds it later). Otherwise rely on the library's
  // output and force RGBA via a tiny decode/encode below.
  try {
    const sharp = (await import('sharp')).default
    await sharp(outBytes).ensureAlpha().png({ compressionLevel: 9 }).toFile(outPath)
    return
  } catch {}

  // Fallback: decode the PNG manually (pngjs), set every pixel to RGBA, re-encode.
  const { PNG } = await import('pngjs')
  const png = PNG.sync.read(outBytes)
  const rgba = Buffer.alloc(png.width * png.height * 4)
  for (let i = 0, j = 0; i < png.data.length; i += 4, j += 4) {
    rgba[j]     = png.data[i]
    rgba[j + 1] = png.data[i + 1]
    rgba[j + 2] = png.data[i + 2]
    rgba[j + 3] = png.data[i + 3]
  }
  const rebuilt = new PNG({ width: png.width, height: png.height })
  rebuilt.data = rgba
  writeFileSync(outPath, PNG.sync.write(rebuilt, { colorType: 6 }))
}

// ---------- step 1: download originals ----------
async function stepDownload() {
  console.log(`\n[1/3] Downloading originals → ${ORIGINALS_DIR}`)
  let downloaded = 0, skipped = 0, failed = 0
  const failures = []
  for (let i = 0; i < targets.length; i++) {
    const p = targets[i]
    const slug = urlToSlug(p.image)
    const ext = extFor(p.image)
    const outPath = join(ORIGINALS_DIR, `${slug}${ext}`)
    if (existsSync(outPath) && statSync(outPath).size > 0) {
      skipped++
      process.stdout.write(`\r  [${i + 1}/${targets.length}] (cached ${skipped}, new ${downloaded}, failed ${failed})`)
      continue
    }
    if (!isRemoteUrl(p.image)) {
      failed++
      failures.push(`${slug}${ext}: image URL is local (${p.image}), cannot re-download`)
      process.stdout.write(`\r  [${i + 1}/${targets.length}] (cached ${skipped}, new ${downloaded}, failed ${failed})`)
      continue
    }
    const highUrl = bumpSize(p.image, 480)
    let lastErr = null
    try {
      const bytes = await downloadBytes(highUrl)
      writeFileSync(outPath, bytes)
      downloaded++
    } catch (err) {
      lastErr = err
      try {
        const bytes = await downloadBytes(p.image)
        writeFileSync(outPath, bytes)
        downloaded++
      } catch (err2) {
        lastErr = err2
      }
    }
    if (lastErr && !existsSync(outPath)) {
      failed++
      failures.push(`${slug}${ext}: ${lastErr.message} (tried ${highUrl} and ${p.image})`)
    }
    process.stdout.write(`\r  [${i + 1}/${targets.length}] (cached ${skipped}, new ${downloaded}, failed ${failed})`)
    await sleep(60)
  }
  process.stdout.write('\n')
  console.log(`  → ${downloaded} new, ${skipped} cached, ${failed} failed`)
  if (failures.length) {
    console.log('\n  Failures:')
    for (const f of failures.slice(0, 5)) console.log(`    - ${f}`)
    if (failures.length > 5) console.log(`    ... and ${failures.length - 5} more`)
  }
}

// ---------- step 2: remove background from local originals ----------
async function stepProcess() {
  console.log(`\n[2/3] Background removal → ${PROCESSED_DIR}`)
  let ok = 0, cached = 0, failed = 0
  const failedDetails = []
  let i = 0
  for (const p of targets) {
    i++
    const slug = urlToSlug(p.image)
    const outPath = join(PROCESSED_DIR, `${slug}.png`)
    if (existsSync(outPath) && statSync(outPath).size > 0) {
      cached++
      process.stdout.write(`\r  [${i}/${targets.length}] (ok ${ok}, cached ${cached}, failed ${failed})`)
      continue
    }
    const ext = extFor(p.image)
    const inPath = join(ORIGINALS_DIR, `${slug}${ext}`)
    if (!existsSync(inPath)) {
      failed++
      failedDetails.push(`${slug}${ext} (missing original)`)
      continue
    }
    try {
      const bytes = await readFile(inPath)
      await writeRgbaPng(bytes, outPath)
      ok++
    } catch (err) {
      failed++
      failedDetails.push(`${slug}${ext}: ${err.message}`)
    }
    process.stdout.write(`\r  [${i}/${targets.length}] (ok ${ok}, cached ${cached}, failed ${failed})`)
  }
  process.stdout.write('\n')
  console.log(`  → ${ok} processed, ${cached} cached, ${failed} failed`)
  if (failedDetails.length) {
    console.log('\n  Failed entries:')
    for (const f of failedDetails) console.log(`    - ${f}`)
  }
}

// ---------- step 3: patch products.js ----------
async function stepPatch() {
  console.log(`\n[3/3] Patching ${PRODUCTS_JS}`)
  const files = (await readdir(PROCESSED_DIR)).filter((f) => f.endsWith('.png'))
  const slugSet = new Set(files.map((f) => f.replace(/\.png$/, '')))

  let updated = 0
  for (const p of PRODUCTS) {
    const slug = urlToSlug(p.image)
    if (slugSet.has(slug)) {
      const local = `/products/${slug}.png`
      if (p.image !== local) {
        p.image = local
        p.images = [local]
        updated++
      }
    }
  }

  const src = await readFile(PRODUCTS_JS, 'utf-8')
  const newBlock = `export const PRODUCTS = ${JSON.stringify(PRODUCTS, null, 2)}\n`
  const re = /export const PRODUCTS\s*=\s*\[[\s\S]*?\n\]\s*\n/
  const next = src.match(re) ? src.replace(re, newBlock) : `${src}\n${newBlock}`
  writeFileSync(PRODUCTS_JS, next, 'utf-8')

  console.log(`  → ${updated} entries now point at /products/<slug>.png (${slugSet.size} PNGs available)`)
}

// ---------- entrypoint ----------
async function main() {
  if (!ONLY_DOWNLOAD) await stepDownload()
  if (SKIP_DOWNLOAD && !existsSync(ORIGINALS_DIR)) {
    console.error('--no-dl set but public/products-originals/ does not exist. Run without --no-dl first.')
    process.exit(1)
  }
  if (!ONLY_DOWNLOAD) await stepProcess()
  else console.log('\n[1/3] Skipped (--dl-only).')
  if (ONLY_DOWNLOAD) return
  await stepPatch()
  console.log('\n✓ Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
