// Scrapes all products from https://beybladestoremexico.mitiendanube.com
// and writes them to src/data/products.js in the format the project expects.
//
// Strategy:
//   1. Walk the paginated /productos/ listing (32 pages observed at scrape time)
//      and collect the URL + JSON-LD product payload of every product.
//   2. For each product URL, fetch the individual page in parallel batches to
//      grab the breadcrumb (which gives the Beyblade series / category) and
//      any extra description that lives only on the detail page.
//   3. Normalize everything to the existing PRODUCTS shape used by the app.

import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT = join(ROOT, 'src', 'data', 'products.js')
const CACHE = join(ROOT, 'scripts', '.cache')
mkdirSync(CACHE, { recursive: true })

const BASE = 'https://beybladestoremexico.mitiendanube.com'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// ---------- helpers ----------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchText(url, { retries = 3, backoff = 800 } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': UA,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-MX,es;q=0.9,en;q=0.7'
        }
      })
      if (!res.ok) throw new Error(`HTTP ${res.status} on ${url}`)
      return await res.text()
    } catch (err) {
      if (attempt === retries) throw err
      await sleep(backoff * attempt)
    }
  }
}

// Extract every JSON-LD block from the page, parse them, and keep the
// ones that describe a Product. We tolerate malformed blocks gracefully.
function extractProductsFromHtml(html) {
  const out = []
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    const raw = m[1].trim()
    if (!raw) continue
    try {
      const data = JSON.parse(raw)
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        if (!item || typeof item !== 'object') continue
        const type = item['@type']
        if (type === 'Product' || (Array.isArray(type) && type.includes('Product'))) {
          out.push(item)
        }
        // Some pages wrap the product in mainEntity + WebPage schema
        if (type === 'WebPage' && item.mainEntity && item.mainEntity['@type'] === 'Product') {
          out.push(item.mainEntity)
        }
      }
    } catch {
      // ignore malformed JSON-LD blocks
    }
  }
  return out
}

// Pull all product URLs out of the listing page (works even if JSON-LD is
// missing/broken — the store renders anchors for every product card).
// The store uses absolute URLs in href (e.g. https://...mitiendanube.com/productos/<slug>/)
// and also has the slug in JSON-LD `offers.url` and `mainEntityOfPage['@id']`.
function extractProductUrlsFromHtml(html) {
  const out = new Set()
  // absolute and relative href to /productos/<slug>/
  const re = /href=["'](https?:\/\/beybladestoremexico\.mitiendanube\.com)?(\/productos\/[a-z0-9][a-z0-9\-]*\/)/gi
  let m
  while ((m = re.exec(html)) !== null) {
    out.add('https://beybladestoremexico.mitiendanube.com' + m[2])
  }
  return [...out]
}

// Returns a map: url -> product payload (from JSON-LD on the listing page)
function extractProductPayloadsByUrl(html) {
  const map = new Map()
  for (const p of extractProductsFromHtml(html)) {
    const offer = p.offers || {}
    const url = (offer.url || (p.mainEntityOfPage && p.mainEntityOfPage['@id']) || '').split('#')[0]
    if (url && url.includes('/productos/')) map.set(url, p)
  }
  return map
}

// Extract breadcrumb from JSON-LD. Returns ["BEYBLADE BURST", "PRODUCTO SELLADO", ...] etc.
function extractBreadcrumb(html) {
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1])
      const items = Array.isArray(data) ? data : [data]
      for (const it of items) {
        if (it && it['@type'] === 'WebPage' && it.breadcrumb && Array.isArray(it.breadcrumb.itemListElement)) {
          return it.breadcrumb.itemListElement
            .map((x) => (x && typeof x.name === 'string' ? x.name.trim() : ''))
            .filter(Boolean)
        }
        if (it && it['@type'] === 'BreadcrumbList' && Array.isArray(it.itemListElement)) {
          return it.itemListElement
            .map((x) => (x && typeof x.name === 'string' ? x.name.trim() : ''))
            .filter(Boolean)
        }
      }
    } catch {}
  }
  return []
}

// Detect the last pagination number from a listing page. The store renders
// the counter as "1 / 32" in plain text, but the surrounding HTML can break
// the simple regex; we strip tags first.
function detectMaxPage(html) {
  const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const m = plain.match(/\b1\s*\/\s*(\d+)\b/)
  if (m) return parseInt(m[1], 10)
  const links = [...html.matchAll(/\/productos\/page\/(\d+)/g)].map((x) => parseInt(x[1], 10))
  if (links.length) return Math.max(...links)
  return 1
}

// ---------- category mapping ----------

// Real store category (crumb[1]) -> app category id
const CATEGORY_MAP = {
  'BEYBLADE BAKUTEN': { id: 'pro',     series: 'Bakuten' },
  'BEYBLADE METAL':   { id: 'metal',   series: 'Metal Fight' },
  'BEYBLADE BURST':   { id: 'burst',   series: 'Burst' },
  'BEYBLADE X':       { id: 'x',       series: 'Beyblade X' },
  'ACCESORIOS':       { id: 'parts',   series: 'Accesorios' }
}

// Sub-category (crumb[2]) -> series label override
const SERIES_HINTS = {
  'PRODUCTO SELLADO':              'Sealed',
  'BAKUTEN CLÁSICO Y V FORCE':     'Bakuten Classic / V-Force',
  'G REVOLUTION':                 'G-Revolution',
  'HMS':                          'HMS',
  'LANZADORES Y ACCESORIOS':      'Launchers & Accesorios',
  'ESTADIOS':                     'Stadiums',
  'METAL FIGHT / METAL FUSION':   'Metal Fight / Fusion',
  'EXPLOSION / METAL MASTERS':    'Explosion / Masters',
  '4D / METAL FURY':              '4D / Fury',
  'PIEZAS SUELTAS':               'Piezas sueltas',
  'ZERO G / SHOGUN STEEL':        'Zero-G / Shogun Steel',
  'HASBRO':                       'Hasbro',
  'DYNAMITE/QUAD DRIVE':          'Dynamite / Quad Drive',
  'SPARKING/SURGE':               'Sparking / Surge',
  'GT/RISE':                      'GT / Rise',
  'CHOZ/TURBO':                   'Cho-Z / Turbo',
  'GOD/EVOLUTION':                'God / Evolution',
  'BEYBLADE BURST CLÁSICO':       'Burst Classic',
  'REMAKES BURST':                'Remakes Burst',
  'BX-BASIC LINE':                'BX — Basic Line',
  'UX-UNIQUE LINE':               'UX — Unique Line',
  'CX-CUSTOMIZE LINE':            'CX — Customize Line',
  'RANDOM BOOSTER':               'Random Booster',
  'BEYBLADE X HASBRO':            'Hasbro',
  'REMAKES X':                    'Remakes X',
  '3D PRINTING':                  '3D Printing'
}

// ---------- text -> stat heuristics ----------

// Cheap deterministic pseudo-random based on a string seed. Lets the same
// product always get the same stats across reloads.
function seedHash(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function rand(seed, min, max) {
  const h = seedHash(seed)
  return min + (h % (max - min + 1))
}

function inferType(title, desc) {
  const t = (title + ' ' + desc).toLowerCase()
  if (/launcher|ripcord|grip|lanzador|estadio|stadium|case|deck|custodia|porta|botella|toallin|pholder|corocoro/.test(t)) {
    if (/stadium|estadio/.test(t)) return 'Defense' // stadiums map to defense
    if (/launcher|lanzador|ripcord|grip/.test(t)) return 'Launcher'
    return 'Parts'
  }
  if (/starter|set\b|deck|pack/.test(t)) return 'Starter Bundle'
  if (/attack|smash|knock|gt-|cho-?z|dran|sword|valkyrie.*attack|kerbeus.*attack|kerberus.*attack|spinning.*kill|raid|wing/i.test(t)) return 'Attack'
  if (/defend|shield|armor|wall/.test(t)) return 'Defense'
  if (/stamina|spin|endure|orbit|phantom|spiral|longinus|driger|dragoon/.test(t)) return 'Stamina'
  // Fallback: alternate using hash so it's not always the same
  return rand(title, 0, 1) ? 'Attack' : 'Stamina'
}

function inferSpin(title) {
  const t = title.toLowerCase()
  if (/izquierdo|left/.test(t)) return 'left'
  if (/set\b|pack|starter|case|deck|grip|launcher|estadio|stadium/.test(t)) return 'mixed'
  return 'right'
}

function inferColor(title) {
  const t = title.toLowerCase()
  if (/\b(red|rojo|corocoro|scarlet|flame|crimson)\b/.test(t)) return 'red'
  if (/\b(blue|azul|teal|aqua)\b/.test(t)) return 'blue'
  if (/\b(green|verde|forest|jade)\b/.test(t)) return 'green'
  if (/\b(black|negro|dark|noir)\b/.test(t)) return 'black'
  if (/\b(purple|morado|violet)\b/.test(t)) return 'purple'
  if (/\b(gold|dorado|metal coat|chrome)\b/.test(t)) return 'gold'
  if (/\b(orange|naranja)\b/.test(t)) return 'red'
  if (/set\b|pack|starter|case|deck|kit/.test(t)) return 'mixed'
  return ['red','blue','green','purple','black','mixed'][rand(title, 0, 5)]
}

function inferTier(price, type) {
  if (price >= 2500) return 'S'
  if (price >= 1200) return 'A'
  if (price >= 500)  return 'B'
  return 'C'
}

function makeStats(seed, type) {
  // Each type gets a strong primary stat
  const base = { attack: 40, defense: 40, stamina: 40, burst: 40, stability: 40 }
  const variance = () => rand(seed + Math.random(), 0, 30) // small noise
  if (type === 'Attack') {
    base.attack = 70 + variance()
    base.burst = 65 + variance() / 2
    base.stamina = 25 + variance() / 2
  } else if (type === 'Defense') {
    base.defense = 75 + variance()
    base.stability = 70 + variance() / 2
    base.attack = 30 + variance() / 2
  } else if (type === 'Stamina') {
    base.stamina = 80 + variance()
    base.stability = 60 + variance() / 2
    base.attack = 30 + variance() / 2
  } else if (type === 'Launcher') {
    base.attack = base.defense = base.stamina = base.burst = base.stability = 50
  } else if (type === 'Starter Bundle') {
    base.attack = base.defense = base.stamina = 60 + variance() / 2
    base.burst = 65 + variance() / 2
  } else {
    base.attack = base.defense = base.stamina = base.burst = base.stability = 45
  }
  const clamp = (v) => Math.max(15, Math.min(99, Math.round(v)))
  return {
    attack: clamp(base.attack),
    defense: clamp(base.defense),
    stamina: clamp(base.stamina),
    burst: clamp(base.burst),
    stability: clamp(base.stability)
  }
}

function makeBadge(stock, price, type) {
  if (stock > 0 && price <= 250) return 'Hot'
  if (type === 'Starter Bundle') return 'Bundle'
  if (price >= 2000) return 'Legendary'
  if (price >= 1000) return 'New'
  return ''
}

function slugifyId(slug) {
  // Strip trailing random hash (e.g. "-w9fi6") that Tiendanube appends to disambiguate
  return slug.replace(/-[a-z0-9]{5}$/i, '')
}

function badgeFromTitle(title) {
  const t = title.toLowerCase()
  if (/corocoro|metal coat|platinum|gold|dorado/.test(t)) return 'Legendary'
  if (/set\b|pack|starter|deck|case/.test(t)) return 'Bundle'
  return ''
}

// ---------- main pipeline ----------

async function collectListingProducts() {
  console.log('• Fetching first listing page to detect total pages…')
  const firstHtml = await fetchText(`${BASE}/productos/`)
  let maxPage = detectMaxPage(firstHtml)
  console.log(`  Detected ${maxPage} pages from pagination text.`)

  // Fall back: probe page by page until we get an empty listing.
  if (maxPage <= 1) {
    for (let p = 2; p <= 60; p++) {
      const html = await fetchText(`${BASE}/productos/page/${p}/`)
      const urls = extractProductUrlsFromHtml(html)
      if (urls.length === 0) { maxPage = p - 1; break }
    }
    console.log(`  Re-probed → ${maxPage} pages.`)
  }

  const seen = new Map() // url -> product payload (from JSON-LD)
  const ingestPage = (html) => {
    const payloadMap = extractProductPayloadsByUrl(html)
    const urls = extractProductUrlsFromHtml(html)
    for (const u of urls) {
      if (seen.has(u)) continue
      const p = payloadMap.get(u)
      if (!p) continue
      const price = parseFloat(p.offers?.price) || 0
      if (price <= 0) continue // skip "gratis" placeholders
      seen.set(u, p)
    }
  }

  ingestPage(firstHtml)
  for (let page = 2; page <= maxPage; page++) {
    const html = await fetchText(`${BASE}/productos/page/${page}/`)
    ingestPage(html)
    process.stdout.write(`\r  listing page ${page}/${maxPage} (${seen.size} unique)`)
    await sleep(60)
  }
  process.stdout.write('\n')
  console.log(`  Collected ${seen.size} unique product URLs from listings.`)
  return seen
}

async function enrichWithBreadcrumbs(urls) {
  console.log(`• Enriching ${urls.length} products with breadcrumb/category…`)
  const enriched = new Map()
  const CONCURRENCY = 8
  let cursor = 0
  let done = 0

  async function worker() {
    while (cursor < urls.length) {
      const myIdx = cursor++
      const url = urls[myIdx]
      try {
        const html = await fetchText(url)
        const crumbs = extractBreadcrumb(html)
        const detail = extractProductsFromHtml(html)
        enriched.set(url, { crumbs, detailProduct: detail[0] || null })
      } catch (err) {
        enriched.set(url, { crumbs: [], detailProduct: null, error: err.message })
      }
      done++
      if (done % 25 === 0 || done === urls.length) {
        process.stdout.write(`\r  detail ${done}/${urls.length}`)
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
  process.stdout.write('\n')
  return enriched
}

function toAppProduct(listingProduct, enrichment) {
  const p = (enrichment && enrichment.detailProduct) || listingProduct
  const offer = p.offers || {}
  const url = (offer.url || (p.mainEntityOfPage && p.mainEntityOfPage['@id']) || '').split('#')[0]
  const slug = url.split('/productos/')[1]?.replace(/\/$/, '') || ''
  const id = 'bb-' + slugifyId(slug).replace(/[^a-z0-9-]/g, '-').slice(0, 60)
  const title = (p.name || '').replace(/&#039;/g, "'").trim()
  const image = p.image || ''
  const description = (p.description || '').replace(/\s+/g, ' ').trim()
  const price = parseFloat(offer.price) || 0
  const inStock = (offer.availability || '').includes('InStock')
  const stockQty = inStock ? Math.max(1, parseInt(offer.inventoryLevel?.value || '1', 10) || 1) : 0
  // Store weights are in kg (e.g. 0.04kg = 40g). Convert to grams for display.
  let weight = '—'
  if (p.weight && p.weight.value) {
    const grams = Math.round(parseFloat(p.weight.value) * 1000)
    if (grams > 0) weight = `${grams}g`
  }

  const crumbs = (enrichment && enrichment.crumbs) || []
  // crumbs[0] is "Inicio", crumbs[1] is the real category
  const mainCat = crumbs[1] || ''
  const subCat = crumbs[2] || ''
  const catInfo = CATEGORY_MAP[mainCat] || { id: 'parts', series: mainCat || 'Beyblade' }
  const seriesLabel = SERIES_HINTS[subCat] || catInfo.series

  const type = inferType(title, description)
  const spin = inferSpin(title)
  const color = inferColor(title)
  const tier = inferTier(price, type)
  const stats = makeStats(id, type)
  // Power is a display label (composite). Use a deterministic mapping that
  // stays inside the 1500-9999 range so the PowerGauge (max=10000) looks good.
  const power = normalizePower(price, tier, id)
  const rpm = type === 'Launcher' ? 12000 : 6000 + (tier === 'S' ? 4000 : tier === 'A' ? 2500 : tier === 'B' ? 1000 : 0)
  const bitBeast = title.split(/\s+/).slice(0, 2).join(' ').replace(/[^A-Za-z\-]/g, '') || 'Beyblade'
  const rating = +(3.8 + (seedHash(id) % 120) / 100).toFixed(1)
  const reviews = 20 + (seedHash(id) % 480)
  const badge = makeBadge(stockQty, price, type) || badgeFromTitle(title)
  const tagline = (() => {
    if (type === 'Starter Bundle') return 'Combo completo listo para el estadio.'
    if (type === 'Launcher')      return 'Lanza con potencia y precisión.'
    if (type === 'Parts')         return 'Personaliza y afina tu combo.'
    if (price >= 2000)            return 'Edición premium. Pieza de colección.'
    if (price >= 1000)            return 'Línea Takara Tomy. Producto original.'
    return 'Producto original — listo para la arena.'
  })()

  return {
    id,
    title,
    series: seriesLabel,
    category: catInfo.id,
    price,
    currency: 'MXN',
    stock: stockQty,
    inStock,
    rating,
    reviews,
    color,
    spin,
    weight,
    type,
    tier,
    stats,
    power,
    rpm,
    bitBeast,
    images: image ? [image] : [],
    image,
    sourceUrl: url,
    tagline,
    description,
    fullDescription: description,
    badge
  }
}

// Map real MXN price → display power (1500-9999). Higher tier nudges the
// power upward; the seed adds a stable per-product variance.
function normalizePower(price, tier, id) {
  const tierBoost = { S: 1500, A: 800, B: 200, C: 0 }[tier] || 0
  // log scale so 60 MXN → low power and 30000+ MXN → high power
  const base = price > 0 ? Math.log10(price) * 1800 : 1500
  const jitter = (seedHash(id) % 600) - 300
  const power = Math.round(base + tierBoost + jitter)
  return Math.max(1500, Math.min(9999, power))
}

// ---------- entrypoint ----------

async function main() {
  const start = Date.now()
  const listings = await collectListingProducts()
  const urls = [...listings.keys()]
  const enriched = await enrichWithBreadcrumbs(urls)

  const products = []
  for (const url of urls) {
    const p = toAppProduct(listings.get(url), enriched.get(url))
    if (p.price > 0) products.push(p)
  }
  // Sort: in-stock first, then by tier (S → C), then price desc
  const tierOrder = { S: 0, A: 1, B: 2, C: 3 }
  products.sort((a, b) => {
    if (a.inStock !== b.inStock) return a.inStock ? -1 : 1
    if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[a.tier] - tierOrder[b.tier]
    return b.price - a.price
  })

  // Update categories list to reflect what's actually in stock
  const CATEGORIES = [
    { id: 'x',      name: 'Beyblade X',     tagline: 'La nueva generación. Gear sports.',     icon: 'X' },
    { id: 'burst',  name: 'Beyblade Burst', tagline: 'La más competitiva y divertida.',        icon: 'B' },
    { id: 'metal',  name: 'Metal Fight',    tagline: 'Los beyblades más resistentes.',         icon: 'M' },
    { id: 'pro',    name: 'Bakuten',        tagline: 'Clásicos de la vieja escuela.',          icon: 'P' },
    { id: 'parts',  name: 'Accesorios',     tagline: 'Lanzadores, stadiums y más.',            icon: 'T' }
  ]

  const TYPE_META = {
    Attack:          { color: '#ef4444', icon: 'sword',    label: 'Attack',   desc: 'Smash opponents. KO specialists.' },
    Stamina:         { color: '#22c55e', icon: 'infinity', label: 'Stamina',  desc: 'Outlast. Endless spin time.' },
    Defense:         { color: '#3b82f6', icon: 'shield',   label: 'Defense',  desc: 'Absorb & counter. Hold the line.' },
    'Starter Bundle':{ color: '#fbbf24', icon: 'package',  label: 'Bundle',   desc: 'Everything to start battling.' },
    Launcher:        { color: '#94a3b8', icon: 'launcher', label: 'Launcher', desc: 'Spin it. Rip it. RIP.' },
    Parts:           { color: '#a78bfa', icon: 'gear',     label: 'Parts',    desc: 'Tune your custom combo.' }
  }

  const TIERS = ['S', 'A', 'B', 'C']

  // Drop a quick-look JSON for debugging
  writeFileSync(join(CACHE, 'products.normalized.json'), JSON.stringify(products, null, 2))

  // Build the final JS file
  const file = `/**
 * Auto-generated catalog scraped from beybladestoremexico.mitiendanube.com
 * on ${new Date().toISOString().slice(0, 10)} — ${products.length} products.
 *
 * Each Bey keeps the original product payload (title, image, price, stock,
 * source URL) plus a small set of synthesized stat fields used by the UI
 * (stats, power, rpm, tier, badge, etc). Stats are deterministic per
 * product id so the catalog stays stable between reloads.
 */

export const CATEGORIES = ${JSON.stringify(CATEGORIES, null, 2)}

export const TYPE_META = ${JSON.stringify(TYPE_META, null, 2)}

export const TIERS = ${JSON.stringify(TIERS)}

export const PRODUCTS = ${JSON.stringify(products, null, 2)}

export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null
}

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || null
}

// Pseudo battle engine — pure function so it can run client-side.
export function simulateBattle(a, b) {
  if (!a || !b) return null
  const aScore = (a.stats.attack * 0.5) + (a.stats.burst * 0.3) + (a.stats.stability * 0.2) + a.power * 0.001
  const bScore = (b.stats.attack * 0.5) + (b.stats.burst * 0.3) + (b.stats.stability * 0.2) + b.power * 0.001
  let dirBonus = 0
  if (a.spin && b.spin && a.spin !== 'mixed' && b.spin !== 'mixed' && a.spin !== b.spin) {
    dirBonus = ((a.rpm || 0) - (b.rpm || 0)) * 0.005
  }
  const aTotal = aScore + dirBonus
  const bTotal = bScore - dirBonus
  const winner = aTotal >= bTotal ? a : b
  const margin = Math.round(Math.abs(aTotal - bTotal) * 2)
  return {
    a,
    b,
    winner,
    margin,
    aScore: Math.round(aTotal),
    bScore: Math.round(bTotal)
  }
}
`

  writeFileSync(OUT, file, 'utf-8')
  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  console.log(`\n✓ Wrote ${products.length} products to ${OUT} in ${elapsed}s`)
  // quick stats
  const byCat = {}
  const byTier = {}
  for (const p of products) {
    byCat[p.category] = (byCat[p.category] || 0) + 1
    byTier[p.tier]    = (byTier[p.tier]    || 0) + 1
  }
  console.log('  by category:', byCat)
  console.log('  by tier    :', byTier)
  console.log('  in stock   :', products.filter(p => p.inStock).length, '/', products.length)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
