<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useUiStore } from '@/stores/ui'
import { CATEGORIES, simulateBattle } from '@/data/products'
import ProductCard from '@/components/ProductCard.vue'
import RevealOnScroll from '@/components/ui/RevealOnScroll.vue'
import BeybladeSpinner from '@/components/ui/BeybladeSpinner.vue'
import HeroBeyblades from '@/components/ui/HeroBeyblades.vue'
import BeybladeTierList from '@/components/ui/BeybladeTierList.vue'
import BattlePreview from '@/components/ui/BattlePreview.vue'
import TypeBadge from '@/components/ui/TypeBadge.vue'
import SpinArrow from '@/components/ui/SpinArrow.vue'
import PowerGauge from '@/components/ui/PowerGauge.vue'
import LiveBattleTicker from '@/components/ui/LiveBattleTicker.vue'

const products = useProductsStore()
const cart = useCartStore()
const ui = useUiStore()
const featured = computed(() => products.featured)
const deals = computed(() =>
  products.items.filter(p => p.badge === 'Hot' || p.badge === 'Bundle' || p.badge === 'Bestseller').slice(0, 3)
)

// Tier groupings
const tierGroups = computed(() => {
  const map = { S: [], A: [], B: [], C: [] }
  for (const p of products.items) {
    if (p.tier && map[p.tier]) map[p.tier].push(p)
  }
  return map
})

// Top power beys for leaderboard
const leaderboard = computed(() =>
  [...products.items].filter(p => p.power > 1000).sort((a, b) => b.power - a.power).slice(0, 5)
)

// Battle arena — pick 2 beys
const battleA = ref(null)
const battleB = ref(null)
const battleOptions = computed(() => products.items.filter(p => p.power > 1000))
function randomize() {
  const pool = battleOptions.value
  if (pool.length < 2) return
  const a = pool[Math.floor(Math.random() * pool.length)]
  let b = pool[Math.floor(Math.random() * pool.length)]
  while (b.id === a.id) b = pool[Math.floor(Math.random() * pool.length)]
  battleA.value = a
  battleB.value = b
}
function launchWinner(result) {
  const winner = result?.winner || result
  if (!winner || !winner.title) return
  cart.add(winner, 1)
  ui.toast({ title: '⚡ ' + winner.title + ' added!', content: `${winner.power} PWR — straight to your arena.`, color: 'gold', icon: '🏆' })
}

// Watch for products to load, then randomize battle matchup
watch(() => products.loaded, (loaded) => {
  if (loaded) randomize()
}, { immediate: true })

const stats = [
  { label: 'Beys in stock', value: '15K+' },
  { label: 'Stadiums served', value: '94' },
  { label: 'Avg. shipping', value: '48h' },
  { label: 'Tournament wins', value: '1,280' }
]

// Hero orbiters
const orbiters = [
  { src: '/products/img_1622-c00334121d6c48b59f17249617798093.webp.png', radius: '40%', size: 110, speed: 8, spin: '3.2s', streak: 'hero-streak-red', alt: 'Tournament battle' },
  { src: '/products/img_1623-8aef0cbd979a806d0217249616671163.webp.png',     radius: '33%', size: 78,  speed: 5, spin: '1.4s', streak: 'hero-streak-purple', direction: 'ccw', alt: 'Lord Spriggan' },
  { src: '/products/img_1625-101be200e308044e0417249614445311.webp.png',         radius: '48%', size: 86,  speed: 10, spin: '1.8s', streak: 'hero-streak-red', direction: 'ccw', alt: 'Valkyrie' },
  { src: '/products/img_2333-cfeda5df8e4d7c757717285995410907.webp.png',         radius: '44%', size: 72,  speed: 7, spin: '1.6s', streak: 'hero-streak-green', alt: 'Spriggan' },
  { src: '/products/img_2335-7eeda68e644e23014817285994954963.webp.png',           radius: '37%', size: 70,  speed: 6, spin: '1.5s', streak: 'hero-streak-red', direction: 'ccw', alt: 'L-Drago' },
  { src: '/products/img_2337-2b33a8af5e1d4f947217285994483369.webp.png',          radius: '51%', size: 78,  speed: 12, spin: '2s', streak: 'hero-streak-blue', alt: 'Pegasus' }
]
</script>

<template>
  <div>
  <!-- Hero -->
  <section class="relative overflow-hidden pt-12 pb-24">
    <div
      class="absolute inset-0 -z-10"
      :style="{
        background: `radial-gradient(circle at ${50 + mouseX * 8}% ${50 + mouseY * 8}%, rgba(99,102,241,0.18), transparent 55%)`
      }"
    />
    <div class="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <div class="inline-flex items-center gap-2 chip mb-6">
          <span class="relative flex h-2 w-2">
            <span class="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent-gold"></span>
            <span class="relative inline-flex h-2 w-2 rounded-full bg-accent-gold"></span>
          </span>
          New drop · Lord Spriggan in stock
        </div>
        <h1 class="font-display text-5xl leading-[0.95] sm:text-7xl lg:text-[6rem]">
          <span class="block gradient-text">LET IT</span>
          <span class="block text-white">RIP.</span>
        </h1>
        <p class="mt-6 max-w-lg text-lg text-slate-300">
          The official home for premium Beyblades. Real metal, real bursts, real battles — engineered for stadium domination.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink to="/shop" class="btn-primary !py-3 !px-7 text-base">⚡ Launch the store</RouterLink>
          <RouterLink to="/shop/burst" class="btn-secondary !py-3 !px-7 text-base">Explore Burst</RouterLink>
        </div>
        <dl class="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div v-for="s in stats" :key="s.label">
            <dt class="text-xs uppercase tracking-widest text-slate-400">{{ s.label }}</dt>
            <dd class="mt-1 font-display text-2xl text-white counter" :data-target="s.value">{{ s.value }}</dd>
          </div>
        </dl>
      </div>

      <div class="relative flex items-center justify-center lg:justify-end">
        <HeroBeyblades
          image='/products/img_2337-2b33a8af5e1d4f947217285994483369.webp.png'
          alt="Lord Spriggan — premium Burst Beyblade"
          :orbiters="orbiters"
          :size="520"
        />
        <div class="pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 flex w-full justify-center lg:left-auto lg:right-0 lg:translate-x-0">
          <span class="rounded-full border border-white/10 bg-storm/60 px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-slate-300 backdrop-blur">
            Burst · Real · Spin ↑
          </span>
        </div>
      </div>
    </div>
  </section>

  <!-- Battle arena — pick 2, see them clash -->
  <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <RevealOnScroll>
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <p class="chip">Live battle simulator</p>
          <h2 class="mt-2 font-display text-3xl sm:text-5xl text-white">Pick. Launch. <span class="gradient-text">RIP.</span></h2>
          <p class="mt-2 max-w-2xl text-slate-400">Two beys enter the stadium. Same spin direction = pure stats war. Opposite spins = direction bonus goes to higher RPM. Winner goes straight to your cart.</p>
        </div>
        <button class="btn-secondary !py-2 !px-5 self-start sm:self-auto" @click="randomize">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path d="M21 12a9 9 0 11-9-9c2.5 0 4.7 1 6.4 2.6L21 8"/><path d="M21 3v5h-5"/></svg>
          Shuffle matchup
        </button>
      </div>

      <div v-if="battleA && battleB" class="grid gap-6 lg:grid-cols-[1fr_auto_1fr] items-stretch">
        <!-- Bey A picker -->
        <div class="card-surface relative overflow-hidden p-5">
          <div class="flex items-start gap-3">
            <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-stadium">
              <div class="streak absolute inset-1 opacity-70 animate-spin-slow"></div>
              <img :src="battleA.images[0]" :alt="battleA.title" class="absolute inset-0 m-auto h-14 w-14 object-contain" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="truncate text-sm font-semibold text-white">{{ battleA.title }}</p>
              <div class="mt-1 flex items-center gap-2">
                <TypeBadge :type="battleA.type" size="sm" :glow="false" />
                <SpinArrow :direction="battleA.spin" :size="20" :spinning="false" />
              </div>
            </div>
            <PowerGauge :value="battleA.power" :max="10000" label="PWR" :size="92" :show-label="false" />
          </div>
          <select v-model="battleA" class="mt-4 w-full input !py-2 text-sm">
            <option v-for="p in battleOptions" :key="p.id" :value="p">{{ p.title }} · {{ p.power }} PWR</option>
          </select>
        </div>

        <!-- VS -->
        <div class="flex items-center justify-center lg:flex-col">
          <div class="font-display text-6xl text-accent-gold/70 tracking-widest">VS</div>
        </div>

        <!-- Bey B picker -->
        <div class="card-surface relative overflow-hidden p-5">
          <div class="flex items-start gap-3">
            <PowerGauge :value="battleB.power" :max="10000" label="PWR" :size="92" :show-label="false" />
            <div class="flex-1 min-w-0">
              <p class="truncate text-sm font-semibold text-white">{{ battleB.title }}</p>
              <div class="mt-1 flex items-center gap-2">
                <TypeBadge :type="battleB.type" size="sm" :glow="false" />
                <SpinArrow :direction="battleB.spin" :size="20" :spinning="false" />
              </div>
            </div>
            <div class="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-stadium">
              <div class="streak absolute inset-1 opacity-70 animate-spin-slow"></div>
              <img :src="battleB.images[0]" :alt="battleB.title" class="absolute inset-0 m-auto h-14 w-14 object-contain" />
            </div>
          </div>
          <select v-model="battleB" class="mt-4 w-full input !py-2 text-sm">
            <option v-for="p in battleOptions" :key="p.id" :value="p">{{ p.title }} · {{ p.power }} PWR</option>
          </select>
        </div>
      </div>

      <div v-if="battleA && battleB" class="mt-6">
        <BattlePreview :a="battleA" :b="battleB" @finish="launchWinner" />
      </div>
    </RevealOnScroll>
  </section>

  <!-- Categories -->
  <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24">
    <RevealOnScroll>
      <div class="flex items-end justify-between gap-4 mb-8">
        <div>
          <p class="chip">Categories</p>
          <h2 class="mt-2 font-display text-3xl sm:text-4xl text-white">Find your arena</h2>
        </div>
        <RouterLink to="/shop" class="btn-ghost">All collections →</RouterLink>
      </div>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <RouterLink
          v-for="c in CATEGORIES"
          :key="c.id"
          :to="`/shop/${c.id}`"
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-rip-400/50 hover:shadow-glow"
        >
          <div class="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rip-500/20 blur-2xl transition group-hover:bg-rip-400/40"></div>
          <div class="relative">
            <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rip-500 to-rip-700 font-display text-2xl text-white">{{ c.icon }}</span>
            <h3 class="mt-4 font-display text-2xl text-white">{{ c.name }}</h3>
            <p class="mt-1 text-xs text-slate-400">{{ c.tagline }}</p>
          </div>
        </RouterLink>
      </div>
    </RevealOnScroll>
  </section>

  <!-- Featured -->
  <section class="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
    <RevealOnScroll>
      <div class="flex items-end justify-between gap-4 mb-8">
        <div>
          <p class="chip">Featured</p>
          <h2 class="mt-2 font-display text-3xl sm:text-4xl text-white">Top of the meta</h2>
        </div>
        <RouterLink to="/shop" class="btn-ghost">Browse all →</RouterLink>
      </div>
      <div v-if="!products.loaded" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="h-[440px] rounded-3xl skeleton"></div>
      </div>
      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(p, idx) in featured"
          :key="p.id"
          class="animate-fade-up"
          :style="{ animationDelay: (idx * 80) + 'ms' }"
        >
          <ProductCard :product="p" />
        </div>
      </div>
    </RevealOnScroll>
  </section>

  <!-- Tier list + leaderboard -->
  <section class="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
    <RevealOnScroll>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div class="flex items-end justify-between gap-4 mb-6">
            <div>
              <p class="chip">Power tier list</p>
              <h2 class="mt-2 font-display text-3xl sm:text-4xl text-white">Ranked by community meta</h2>
              <p class="mt-2 max-w-2xl text-slate-400">Curated by tournament champions. Higher tier = higher win-rate in stadium. Pick a beys to see the breakdown.</p>
            </div>
          </div>
          <BeybladeTierList :tiers="tierGroups" />
        </div>
        <aside>
          <div class="card-surface sticky top-24 p-5">
            <p class="chip">Leaderboard</p>
            <h3 class="mt-2 font-display text-2xl text-white">Top by power</h3>
            <ul class="mt-4 space-y-3">
              <li
                v-for="(p, i) in leaderboard"
                :key="p.id"
                class="flex items-center gap-3"
              >
                <span
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-sm"
                  :style="{
                    background: i === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : i === 1 ? 'linear-gradient(135deg, #cbd5e1, #94a3b8)' : i === 2 ? 'linear-gradient(135deg, #fdba74, #c2410c)' : 'rgba(255,255,255,0.06)',
                    color: i < 3 ? '#0b1020' : '#cbd5e1',
                    boxShadow: i === 0 ? '0 0 12px rgba(251,191,36,0.6)' : 'none'
                  }"
                >#{{ i + 1 }}</span>
                <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg ring-stadium">
                  <div class="streak absolute inset-0.5 opacity-50 animate-spin-slow"></div>
                  <img :src="p.images[0]" :alt="p.title" class="absolute inset-0 m-auto h-9 w-9 object-contain" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="truncate text-sm font-semibold text-white">{{ p.title }}</p>
                  <TypeBadge :type="p.type" size="sm" :glow="false" />
                </div>
                <div class="text-right">
                  <p class="font-display text-sm text-accent-gold tabular-nums">{{ p.power }}</p>
                  <p class="text-[9px] uppercase tracking-widest text-slate-500">PWR</p>
                </div>
              </li>
            </ul>
            <RouterLink to="/shop" class="btn-secondary mt-5 w-full !justify-center">Open catalog</RouterLink>
          </div>

          <LiveBattleTicker class="mt-4" />
        </aside>
      </div>
    </RevealOnScroll>
  </section>

  <!-- Deals / Big promo -->
  <section class="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
    <RevealOnScroll>
      <div class="relative overflow-hidden rounded-3xl border border-rip-500/30 bg-gradient-to-br from-rip-700 via-storm to-storm-light p-8 sm:p-12">
        <div class="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent-gold/20 blur-3xl"></div>
        <div class="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-rip-400/30 blur-3xl"></div>
        <div class="relative grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p class="chip chip-active">Storm Sale · 20% off</p>
            <h2 class="mt-3 font-display text-4xl sm:text-6xl text-white">GEAR UP. <br><span class="gradient-text">SPIN OUT.</span></h2>
            <p class="mt-4 max-w-md text-slate-300">Use code <kbd class="rounded bg-white/10 px-2 py-1 font-mono text-sm text-white">STORM20</kbd> at checkout. Free shipping over $75.</p>
            <RouterLink to="/shop" class="btn-primary mt-6 inline-flex">⚡ Rip the sale</RouterLink>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div
              v-for="(d, i) in deals"
              :key="d.id"
              class="group relative h-44 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-2"
            >
              <BeybladeSpinner :size="84" class="absolute right-2 top-2 opacity-30" :speed="i === 0 ? 'fast' : 'normal'" />
              <img :src="d.images[0]" :alt="d.title" class="absolute bottom-1 left-1/2 h-24 w-24 -translate-x-1/2 object-contain drop-shadow-[0_8px_15px_rgba(0,0,0,0.6)] transition group-hover:scale-110" loading="lazy" />
              <div class="relative mt-auto flex h-full flex-col justify-end">
                <p class="truncate text-xs font-semibold text-white">{{ d.title }}</p>
                <p class="text-xs text-accent-gold">${{ d.price.toFixed(2) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RevealOnScroll>
  </section>

  <!-- How it works -->
  <section class="mx-auto mt-24 max-w-7xl px-4 sm:px-6 lg:px-8">
    <RevealOnScroll>
      <div class="text-center mb-12">
        <p class="chip mx-auto">How it works</p>
        <h2 class="mt-2 font-display text-3xl sm:text-4xl text-white">From box to battle in 48 hours</h2>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <div v-for="step in [
          { t: 'Pick your combo', d: 'Browse the catalog. Filter by spin, weight and type.', i: '①' },
          { t: 'Launch with code', d: 'Apply LETITRIP10 at checkout. Free shipping over $75.', i: '②' },
          { t: 'Battle & win', d: 'Rate your pulls, build a wishlist, climb the leaderboard.', i: '③' }
        ]" :key="step.t" class="card-surface relative p-6">
          <span class="absolute right-4 top-4 font-display text-4xl text-rip-500/40">{{ step.i }}</span>
          <div class="streak absolute inset-2 rounded-2xl opacity-20"></div>
          <h3 class="font-display text-2xl text-white">{{ step.t }}</h3>
          <p class="mt-2 text-sm text-slate-400">{{ step.d }}</p>
        </div>
      </div>
    </RevealOnScroll>
  </section>
  </div>
</template>
