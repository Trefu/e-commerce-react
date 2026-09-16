import { readFileSync } from 'node:fs'
const src = readFileSync('src/components/ProductCard.vue', 'utf-8')
const RE = /<([a-zA-Z][\w-]*)\b[^>]*?\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*?\/>\s*|<([a-zA-Z][\w-]*)\b[^>]*?\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')[^>]*?>([\s\S]*?)<\/\4>\s*/g
const matches = [...src.matchAll(RE)]
console.log('Matches:', matches.length)
for (const m of matches.slice(0, 10)) {
  const cls = m[2] ?? m[3] ?? m[5] ?? m[6] ?? ''
  if (cls.includes('streak')) console.log('FOUND streak:', cls.slice(0, 100))
}
