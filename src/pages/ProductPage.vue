<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useUiStore } from '@/stores/ui'
import { simulateBattle } from '@/data/products'
import StarRating from '@/components/ui/StarRating.vue'
import ProgressRing from '@/components/ui/ProgressRing.vue'
import ProductCard from '@/components/ProductCard.vue'
import RevealOnScroll from '@/components/ui/RevealOnScroll.vue'
import BeybladeStats from '@/components/ui/BeybladeStats.vue'
import TypeBadge from '@/components/ui/TypeBadge.vue'
import SpinArrow from '@/components/ui/SpinArrow.vue'
import PowerGauge from '@/components/ui/PowerGauge.vue'
import BattlePreview from '@/components/ui/BattlePreview.vue'

const route = useRoute()
const router = useRouter()
const products = useProductsStore()
const cart = useCartStore()
const wishlist = useWishlistStore()
const ui = useUiStore()

const product = computed(() => products.byId(route.params.id))
const related = computed(() => products.related(product.value, 4))
const galleryIndex = ref(0)
const qty = ref(1)
const tilt = ref({ rx: 0, ry: 0, active: false })

const ratings = computed(() => {
  if (!product.value) return null
  const total = product.value.reviews
  const r5 = Math.round(total * 0.62)
  const r4 = Math.round(total * 0.22)
  const r3 = Math.round(total * 0.10)
  const r2 = Math.round(total * 0.04)
  const r1 = total - r5 - r4 - r3 - r2
  return [
    { stars: 5, count: r5 },
    { stars: 4, count: r4 },
    { stars: 3, count: r3 },
    { stars: 2, count: r2 },
    { stars: 1, count: r1 }
  ]
})

const sampleReviews = [
  { name: 'Kairos', stars: 5, body: 'Crushes every defense type. Worth every spin.', date: '2 days ago' },
  { name: 'Lyra', stars: 5, body: 'My kid hasn\'t put it down since the box arrived. Packaging is 🔥.', date: '1 week ago' },
  { name: 'Tomás', stars: 4, body: 'Solid bey. Slightly faster than expected in the stadium.', date: '2 weeks ago' }
]

// Auto-pick a battle opponent — different type, similar power
const battleOpponent = computed(() => {
  if (!product.value) return null
  const candidates = products.items.filter(p =>
    p.id !== product.value.id &&
    p.power > 500 &&
    p.type !== product.value.type
  )
  if (!candidates.length) return null
  return candidates.sort((a, b) => Math.abs(a.power - product.value.power) - Math.abs(b.power - product.value.power))[0]
})

const battleResult = computed(() => {
  if (!product.value || !battleOpponent.value) return null
  return simulateBattle(product.value, battleOpponent.value)
})

const hero = ref(null)

function onMove(e) {
  if (!hero.value) return
  const r = hero.value.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width - 0.5
  const y = (e.clientY - r.top) / r.height - 0.5
  tilt.value = { rx: -y * 14, ry: x * 16, active: true }
}
function onLeave() { tilt.value = { rx: 0, ry: 0, active: false } }

function setGallery(i) { galleryIndex.value = i }

function add() {
  if (!product.value) return
  cart.add(product.value, qty.value)
}

function buyNow() {
  if (!product.value) return
  cart.add(product.value, qty.value)
  router.push('/checkout')
}

function burst() {
  ui.toast({ title: '⚡ RIP! Added to arena', content: `${qty.value} × ${product.value.title}`, color: 'green', icon: '🏆' })
  spawnConfetti()
}

const dots = ref([])
function spawnConfetti() {
  const colors = ['#fbbf24', '#6366f1', '#22c55e', '#ef4444', '#38bdf8']
  dots.value = Array.from({ length: 18 }, () => ({
    left: Math.random() * 100 + '%',
    top:  Math.random() * 40 + '%',
    color: colors[Math.floor(Math.random() * colors.length)],
    tx: (Math.random() - 0.5) * 200 + 'px'
  }))
  setTimeout(() => dots.value = [], 1500)
}

function onKey(e) {
  if (!product.value || !product.value.images.length) return
  if (e.key === 'ArrowRight') galleryIndex.value = (galleryIndex.value + 1) % product.value.images.length
  if (e.key === 'ArrowLeft') galleryIndex.value = (galleryIndex.value - 1 + product.value.images.length) % product.value.images.length
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

const tierColors = { S: '#fbbf24', A: '#a78bfa', B: '#60a5fa', C: '#94a3b8' }
const tierColor = computed(() => tierColors[product.value?.tier] || '#94a3b8')
</script>

<template>
  <div>
  <div v-if="!products.loaded" class="flex items-center justify-center py-32">
    <ProgressRing :rate="0.6" :size="64" />
  </div>

  <div v-else-if="!product" class="mx-auto max-w-2xl px-4 py-24 text-center">
    <p class="font-display text-3xl text-white">Beyblade not found.</p>
    <RouterLink to="/shop" class="btn-primary mt-6 inline-flex">Back to shop</RouterLink>
  </div>

  <div v-else class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <nav class="mb-6 flex items-center gap-2 text-xs text-slate-400">
      <RouterLink to="/" class="hover:text-white">Home</RouterLink>
      <span>/</span>
      <RouterLink to="/shop" class="hover:text-white">Shop</RouterLink>
      <span>/</span>
      <RouterLink :to="`/shop/${product.category}`" class="hover:text-white capitalize">{{ product.category }}</RouterLink>
      <span>/</span>
      <span class="text-slate-300">{{ product.title }}</span>
    </nav>

    <div class="grid gap-12 lg:grid-cols-2">
      <!-- Gallery -->
      <div>
        <div
          ref="hero"
          class="relative aspect-square overflow-hidden rounded-3xl ring-stadium"
          @mousemove="onMove"
          @mouseleave="onLeave"
        >
          <div class="streak absolute inset-6 opacity-80" :class="tilt.active ? 'animate-spin-fast' : 'animate-spin-slow'"></div>
          <transition name="img" mode="out-in">
            <img
              :key="galleryIndex"
              :src="product.images[galleryIndex]"
              :alt="product.title"
              class="absolute inset-0 m-auto h-[78%] w-[78%] object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)]"
              :style="{ transform: `rotateY(${tilt.ry * 2}deg) rotateX(${tilt.rx * 2}deg)` }"
            />
          </transition>
          <span class="absolute left-4 top-4 chip">{{ product.series }}</span>
          <!-- Tier badge -->
          <div
            v-if="product.tier"
            class="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl font-display text-2xl text-storm"
            :style="{ background: `linear-gradient(135deg, ${tierColor}, ${tierColor}aa)`, boxShadow: `0 0 18px ${tierColor}aa` }"
          >{{ product.tier }}</div>
          <span v-if="product.badge" class="absolute right-4 top-20 rounded-full bg-gradient-to-r from-accent-gold to-yellow-300 px-3 py-1 text-xs font-bold uppercase tracking-wider text-storm shadow-lg">{{ product.badge }}</span>

          <!-- Confetti dots -->
          <span v-for="(d, i) in dots" :key="i"
            class="confetti-dot"
            :style="{ left: d.left, top: d.top, background: d.color, '--tx': d.tx }"
          ></span>
        </div>
        <div v-if="product.images.length > 1" class="mt-4 flex gap-3">
          <button
            v-for="(src, i) in product.images"
            :key="i"
            class="h-20 w-20 overflow-hidden rounded-2xl border-2 transition"
            :class="galleryIndex === i ? 'border-rip-400 shadow-glow' : 'border-white/10 opacity-60 hover:opacity-100'"
            @click="setGallery(i)"
          >
            <img :src="src" :alt="product.title + ' view ' + (i + 1)" class="h-full w-full object-contain" />
          </button>
        </div>
      </div>

      <!-- Info -->
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <TypeBadge :type="product.type" size="lg" />
          <SpinArrow :direction="product.spin" :size="32" :label="true" />
          <span class="ml-auto text-xs uppercase tracking-widest text-slate-400">{{ product.weight }} · {{ product.bitBeast }}</span>
        </div>
        <h1 class="mt-3 font-display text-4xl sm:text-5xl text-white">{{ product.title }}</h1>
        <div class="mt-3 flex items-center gap-3">
          <StarRating :value="product.rating" />
          <span class="text-sm text-slate-300">{{ product.rating.toFixed(1) }} · {{ product.reviews }} reviews</span>
          <span class="text-sm text-slate-500">·</span>
          <span class="text-sm text-accent-gold">{{ product.power }} PWR</span>
        </div>
        <p class="mt-5 text-lg text-slate-300">{{ product.tagline }}</p>
        <div class="mt-6 flex items-baseline gap-3">
          <span class="font-display text-5xl text-white">${{ product.price.toFixed(2) }}</span>
          <span class="text-sm text-slate-500">or 3 × ${{ (product.price / 3).toFixed(2) }}</span>
        </div>

        <p class="mt-2 text-sm" :class="product.stock > 0 ? 'text-accent-green' : 'text-accent-red'">
          {{ product.stock > 0 ? `Only ${product.stock} left — order soon` : 'Currently sold out' }}
        </p>

        <div class="mt-6 flex items-center gap-3">
          <div class="flex items-center overflow-hidden rounded-full border border-white/10 bg-white/5">
            <button class="px-3 py-2 text-lg" :disabled="qty <= 1" @click="qty = Math.max(1, qty - 1)">−</button>
            <span class="min-w-[2.5rem] text-center font-display text-xl text-white">{{ qty }}</span>
            <button class="px-3 py-2 text-lg" :disabled="qty >= product.stock" @click="qty = Math.min(product.stock, qty + 1)">+</button>
          </div>
          <button class="btn-primary flex-1 !py-3" :disabled="product.stock <= 0" @click="add(); burst()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            ⚡ Launch to cart
          </button>
          <button class="btn-secondary !py-3" @click="buyNow">RIP now</button>
        </div>

        <div class="mt-4 flex gap-2">
          <button
            class="btn-ghost flex-1 !justify-center !border !border-white/10"
            :class="wishlist.has(product.id) && '!text-accent-red'"
            @click="wishlist.toggle(product.id)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            {{ wishlist.has(product.id) ? 'In wishlist' : 'Wishlist' }}
          </button>
          <button class="btn-ghost !border !border-white/10" aria-label="Share">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path d="M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
          </button>
        </div>

        <!-- Stat bars -->
        <div class="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div class="mb-4 flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-widest text-slate-400">Performance stats</p>
              <h3 class="font-display text-xl text-white">Stadium breakdown</h3>
            </div>
            <div class="flex items-center gap-3">
              <PowerGauge :value="product.power" :max="10000" label="PWR" :size="110" />
              <PowerGauge :value="product.rpm" :max="12000" label="RPM" :size="110" color="#60a5fa" />
            </div>
          </div>
          <BeybladeStats :stats="product.stats" />
        </div>

        <details class="mt-3 group rounded-2xl border border-white/10 bg-white/[0.03] p-4" open>
          <summary class="cursor-pointer font-display text-lg text-white">Description</summary>
          <p class="mt-3 text-sm leading-relaxed text-slate-300">{{ product.description }}</p>
          <p class="mt-3 text-sm leading-relaxed text-slate-400">{{ product.fullDescription }}</p>
        </details>

        <details class="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <summary class="cursor-pointer font-display text-lg text-white">Specs</summary>
          <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div><dt class="text-slate-400">Bit-Beast</dt><dd class="text-white">{{ product.bitBeast }}</dd></div>
            <div><dt class="text-slate-400">Type</dt><dd class="text-white">{{ product.type }}</dd></div>
            <div><dt class="text-slate-400">Spin</dt><dd class="text-white">{{ product.spin }}</dd></div>
            <div><dt class="text-slate-400">Weight</dt><dd class="text-white">{{ product.weight }}</dd></div>
            <div><dt class="text-slate-400">Series</dt><dd class="text-white">{{ product.series }}</dd></div>
            <div><dt class="text-slate-400">Stock</dt><dd class="text-white">{{ product.stock }} units</dd></div>
            <div><dt class="text-slate-400">Tier</dt><dd class="font-display" :style="{ color: tierColor }">{{ product.tier }}</dd></div>
            <div><dt class="text-slate-400">SKU</dt><dd class="text-white">{{ product.id.toUpperCase() }}</dd></div>
          </dl>
        </details>

        <details class="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <summary class="cursor-pointer font-display text-lg text-white">Shipping & Returns</summary>
          <p class="mt-3 text-sm leading-relaxed text-slate-300">
            Free shipping on orders over $75. Express shipping arrives in 24–48h. Returns accepted within 30 days, unopened only. Tournament-tested and battle-ready.
          </p>
        </details>
      </div>
    </div>

    <!-- Battle vs auto-picked opponent -->
    <RevealOnScroll v-if="battleOpponent" class="mt-20">
      <div class="mb-6">
        <p class="chip">Auto-matchup</p>
        <h2 class="mt-2 font-display text-3xl sm:text-4xl text-white">Battle against the meta</h2>
        <p class="mt-2 max-w-2xl text-slate-400">Stats-driven simulation: weighted attack + burst + stability + power. Opposite spin directions award a small advantage to the higher-RPM bey.</p>
      </div>
      <BattlePreview :a="product" :b="battleOpponent" />
      <div v-if="battleResult" class="mt-4 text-center text-sm text-slate-400">
        <span v-if="battleResult.winner.id === product.id" class="text-accent-green">
          ✓ {{ product.title }} wins by {{ battleResult.margin }} power
        </span>
        <span v-else class="text-slate-400">
          {{ battleOpponent.title }} has the edge (+{{ battleResult.margin }} power) — try a different combo.
        </span>
      </div>
    </RevealOnScroll>

    <!-- Reviews -->
    <RevealOnScroll class="mt-20">
      <div class="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div class="card-surface p-6">
          <h3 class="font-display text-2xl text-white">Customer rating</h3>
          <div class="mt-3 flex items-baseline gap-3">
            <span class="font-display text-6xl text-white">{{ product.rating.toFixed(1) }}</span>
            <span class="text-slate-400">/ 5</span>
          </div>
          <StarRating :value="product.rating" />
          <p class="mt-1 text-xs text-slate-400">Based on {{ product.reviews }} verified purchases</p>
          <ul class="mt-4 space-y-1.5">
            <li v-for="r in ratings" :key="r.stars" class="flex items-center gap-2 text-xs">
              <span class="w-6 text-slate-400">{{ r.stars }}★</span>
              <div class="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                <div class="h-full bg-gradient-to-r from-rip-500 to-accent-gold" :style="{ width: (r.count / product.reviews * 100) + '%' }"></div>
              </div>
              <span class="w-8 text-right text-slate-400">{{ r.count }}</span>
            </li>
          </ul>
        </div>
        <div class="space-y-4">
          <h3 class="font-display text-2xl text-white">Recent reviews</h3>
          <transition-group name="review" tag="div" class="space-y-4">
            <article
              v-for="r in sampleReviews" :key="r.name"
              class="card-surface p-5"
            >
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rip-500 to-rip-700 font-semibold text-white">{{ r.name[0] }}</div>
                <div class="flex-1">
                  <p class="font-semibold text-white">{{ r.name }}</p>
                  <p class="text-xs text-slate-400">{{ r.date }}</p>
                </div>
                <StarRating :value="r.stars" :size="14" />
              </div>
              <p class="mt-3 text-sm text-slate-300">{{ r.body }}</p>
            </article>
          </transition-group>
        </div>
      </div>
    </RevealOnScroll>

    <!-- Related -->
    <RevealOnScroll class="mt-20">
      <h3 class="font-display text-3xl text-white">Spin a combo</h3>
      <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <ProductCard v-for="p in related" :key="p.id" :product="p" />
      </div>
    </RevealOnScroll>
  </div>
  </div>
</template>

<style scoped>
.img-enter-active,
.img-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.img-enter-from { opacity: 0; transform: scale(0.96) rotate(-2deg); }
.img-leave-to { opacity: 0; transform: scale(1.04) rotate(2deg); }

.review-enter-active,
.review-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.review-enter-from { opacity: 0; transform: translateY(20px); }
.review-leave-to { opacity: 0; transform: translateX(-20px); }
</style>
