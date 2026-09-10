// Generates stylized Beyblade SVGs into /public/beyblades
// Top-down view: outer attack ring + 3 blades + energy layer + bolt tip
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'beyblades')
mkdirSync(OUT, { recursive: true })

// Colors used across variants
const palettes = {
  red:    { outer: '#ef4444', mid: '#fb7185', bolt: '#fbbf24', glow: '#fecaca' },
  blue:   { outer: '#3b82f6', mid: '#60a5fa', bolt: '#fbbf24', glow: '#bfdbfe' },
  green:  { outer: '#22c55e', mid: '#4ade80', bolt: '#fbbf24', glow: '#bbf7d0' },
  purple: { outer: '#8b5cf6', mid: '#a78bfa', bolt: '#fbbf24', glow: '#ddd6fe' },
  gold:   { outer: '#f59e0b', mid: '#fbbf24', bolt: '#fef3c7', glow: '#fde68a' },
  black:  { outer: '#1f2937', mid: '#475569', bolt: '#fbbf24', glow: '#94a3b8' },
  mixed:  { outer: '#6366f1', mid: '#a5b4fc', bolt: '#fbbf24', glow: '#e0e7ff' }
}

function bladePath(angleDeg, length = 88, width = 56) {
  // Rectangle blade pointing up rotated by angle
  // base is at center; tip extends outward
  const half = width / 2
  const tipX = 0
  const tipY = -length
  const baseTopX1 = -half * 0.4
  const baseTopY1 = -length * 0.55
  const baseTopX2 = half * 0.4
  const baseTopY2 = baseTopY1
  const sideX = half
  const sideY = -length * 0.1
  // Compose in local coords then rotate
  const d = `M 0 0 L ${baseTopX1} ${baseTopY1} L ${tipX * 0.95} ${tipY} L ${baseTopX2} ${baseTopY2} L ${sideX} ${sideY} Z`
  return { d, transform: `rotate(${angleDeg})` }
}

function makeBeyblade({ id, color = 'purple', metal = false, type = 'attack' }) {
  const p = palettes[color] || palettes.purple
  const size = 400
  const cx = size / 2
  const cy = size / 2

  const blades = [0, 120, 240].map(a => bladePath(a, type === 'defense' ? 80 : 95, type === 'stamina' ? 40 : 64))

  // Attack ring outer
  const ringGrad = metal
    ? `<linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2e8f0"/><stop offset="0.4" stop-color="#94a3b8"/><stop offset="0.6" stop-color="#475569"/><stop offset="1" stop-color="#1e293b"/></linearGradient>`
    : `<radialGradient id="outerG" cx="50%" cy="50%" r="50%"><stop offset="60%" stop-color="${p.outer}"/><stop offset="100%" stop-color="${p.mid}"/></radialGradient>`

  const energyGrad = `<radialGradient id="energy" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${p.mid}"/><stop offset="1" stop-color="${p.outer}"/></radialGradient>`

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Beyblade ${id}">
  <defs>
    ${ringGrad}
    ${energyGrad}
    <radialGradient id="boltG" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff7ed"/>
      <stop offset="0.5" stop-color="${p.bolt}"/>
      <stop offset="1" stop-color="#92400e"/>
    </radialGradient>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${p.glow}" stop-opacity="0.6"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
    <filter id="ds" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="6"/>
      <feOffset dx="0" dy="8"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Halo -->
  <circle cx="${cx}" cy="${cy}" r="180" fill="url(#halo)"/>

  <!-- Drop-shadow base -->
  <ellipse cx="${cx}" cy="${cy + 22}" rx="150" ry="22" fill="#000" opacity="0.35"/>

  <!-- Outer attack ring -->
  <circle cx="${cx}" cy="${cy}" r="150" fill="${metal ? 'url(#metal)' : 'url(#outerG)'}" stroke="#0b1020" stroke-width="2"/>
  <!-- Decorative inner band -->
  <circle cx="${cx}" cy="${cy}" r="135" fill="none" stroke="${metal ? '#0b1020' : p.glow}" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="3 6"/>

  <!-- Three blades -->
  <g filter="url(#ds)">
    ${blades.map(b => `
      <g transform="${b.transform}">
        <path d="${b.d}" fill="${metal ? 'url(#metal)' : 'url(#outerG)'}" stroke="#0b1020" stroke-width="2" stroke-linejoin="round"/>
        <path d="${b.d}" fill="none" stroke="${p.glow}" stroke-opacity="0.6" stroke-width="1" stroke-linejoin="round"/>
      </g>
    `).join('')}
  </g>

  <!-- Energy layer disc -->
  <circle cx="${cx}" cy="${cy}" r="92" fill="${metal ? 'url(#metal)' : 'url(#energy)'}" stroke="#0b1020" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="78" fill="none" stroke="${p.glow}" stroke-opacity="0.4" stroke-width="1.5"/>

  <!-- Inner socket -->
  <circle cx="${cx}" cy="${cy}" r="46" fill="#0b1020"/>
  <circle cx="${cx}" cy="${cy}" r="40" fill="url(#energy)" opacity="0.6"/>

  <!-- Bolt tip -->
  <circle cx="${cx}" cy="${cy}" r="26" fill="url(#boltG)" stroke="#0b1020" stroke-width="2"/>
  <!-- Bolt cross -->
  <g stroke="#0b1020" stroke-width="3" stroke-linecap="round">
    <line x1="${cx - 14}" y1="${cy}" x2="${cx + 14}" y2="${cy}"/>
    <line x1="${cx}" y1="${cy - 14}" x2="${cx}" y2="${cy + 14}"/>
  </g>

  <!-- Highlight -->
  <ellipse cx="${cx - 32}" cy="${cy - 48}" rx="34" ry="14" fill="white" opacity="0.18"/>
</svg>
`
}

// Hero (showcase) — bigger, more dramatic
function makeHeroBeyblade() {
  const p = palettes.purple
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-label="Hero Beyblade">
  <defs>
    <linearGradient id="heroOuter" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a5b4fc"/>
      <stop offset="0.5" stop-color="#6366f1"/>
      <stop offset="1" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="heroMetal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f8fafc"/>
      <stop offset="0.5" stop-color="#94a3b8"/>
      <stop offset="1" stop-color="#1e293b"/>
    </linearGradient>
    <radialGradient id="heroBolt" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff7ed"/>
      <stop offset="0.5" stop-color="#fbbf24"/>
      <stop offset="1" stop-color="#92400e"/>
    </radialGradient>
    <radialGradient id="heroHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#818cf8" stop-opacity="0.6"/>
      <stop offset="1" stop-color="#818cf8" stop-opacity="0"/>
    </radialGradient>
    <filter id="heroDs" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
      <feOffset dx="0" dy="14"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.6"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <circle cx="300" cy="300" r="280" fill="url(#heroHalo)"/>
  <ellipse cx="300" cy="320" rx="240" ry="32" fill="#000" opacity="0.35"/>

  <!-- Outer ring -->
  <circle cx="300" cy="300" r="240" fill="url(#heroMetal)" stroke="#0b1020" stroke-width="3"/>
  <circle cx="300" cy="300" r="220" fill="none" stroke="#a5b4fc" stroke-opacity="0.5" stroke-width="2" stroke-dasharray="4 8"/>

  <!-- Blades -->
  ${[0, 120, 240].map(a => `
    <g transform="rotate(${a} 300 300)" filter="url(#heroDs)">
      <path d="M 300 300 L 270 200 L 300 90 L 330 200 L 360 280 Z" fill="url(#heroMetal)" stroke="#0b1020" stroke-width="3" stroke-linejoin="round"/>
      <path d="M 300 300 L 270 200 L 300 90 L 330 200 L 360 280 Z" fill="none" stroke="#a5b4fc" stroke-opacity="0.6" stroke-width="1.5"/>
      <path d="M 300 110 L 290 160 L 310 160 Z" fill="#fbbf24"/>
    </g>
  `).join('')}

  <!-- Energy layer -->
  <circle cx="300" cy="300" r="150" fill="url(#heroOuter)" stroke="#0b1020" stroke-width="3"/>
  <circle cx="300" cy="300" r="128" fill="none" stroke="#fbbf24" stroke-opacity="0.4" stroke-width="2"/>

  <!-- Inner socket -->
  <circle cx="300" cy="300" r="80" fill="#0b1020"/>
  <circle cx="300" cy="300" r="68" fill="url(#heroOuter)" opacity="0.6"/>

  <!-- Bolt -->
  <circle cx="300" cy="300" r="44" fill="url(#heroBolt)" stroke="#0b1020" stroke-width="3"/>
  <g stroke="#0b1020" stroke-width="5" stroke-linecap="round">
    <line x1="270" y1="300" x2="330" y2="300"/>
    <line x1="300" y1="270" x2="300" y2="330"/>
  </g>

  <!-- Highlight -->
  <ellipse cx="245" cy="220" rx="60" ry="22" fill="white" opacity="0.2"/>
</svg>
`
}

// Variants table
const variants = [
  { id: 'hero', custom: true },
  { id: 'burst-valkyrie', color: 'red', metal: false, type: 'attack' },
  { id: 'burst-spriggan', color: 'green', metal: false, type: 'stamina' },
  { id: 'burst-belial', color: 'purple', metal: true, type: 'attack' },
  { id: 'burst-longinus', color: 'red', metal: true, type: 'defense' },
  { id: 'metal-ldrago', color: 'red', metal: true, type: 'attack' },
  { id: 'metal-pegasus', color: 'blue', metal: true, type: 'stamina' },
  { id: 'metal-storm', color: 'blue', metal: true, type: 'attack' },
  { id: 'metal-eagle', color: 'green', metal: true, type: 'defense' },
  { id: 'pro-dragoon', color: 'red', metal: false, type: 'attack' },
  { id: 'pro-draciel', color: 'blue', metal: false, type: 'stamina' },
  { id: 'starter-achilles', color: 'red', metal: false, type: 'stamina' },
  { id: 'starter-dual', color: 'mixed', metal: true, type: 'attack' },
  { id: 'parts-bits', color: 'gold', metal: false, type: 'stamina' },
  { id: 'parts-launcher', color: 'black', metal: true, type: 'defense' }
]

for (const v of variants) {
  const svg = v.custom ? makeHeroBeyblade() : makeBeyblade(v)
  writeFileSync(join(OUT, `${v.id}.svg`), svg, 'utf-8')
  console.log('Wrote', v.id + '.svg')
}

console.log(`Generated ${variants.length} Beyblade SVGs in ${OUT}`)
