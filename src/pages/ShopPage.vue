<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { CATEGORIES, TYPE_META } from '@/data/products'
import ProductCard from '@/components/ProductCard.vue'
import RevealOnScroll from '@/components/ui/RevealOnScroll.vue'
import BeybladeSpinner from '@/components/ui/BeybladeSpinner.vue'
import TypeBadge from '@/components/ui/TypeBadge.vue'
import SpinArrow from '@/components/ui/SpinArrow.vue'

const products = useProductsStore()
const route = useRoute()
const router = useRouter()

const showFilters = ref(false)
const sortOpen = ref(false)
const selectedTypes = ref([])
const selectedTiers = ref([])
const selectedSpin = ref('all')

onMounted(() => {
  const cat = route.params.category
  if (cat && CATEGORIES.find(c => c.id === cat)) {
    products.setCategory(cat)
  }
})

watch(() => route.params.category, (cat) => {
  if (cat && CATEGORIES.find(c => c.id === cat)) {
    products.setCategory(cat)
  } else if (!cat && route.name === 'shop') {
    products.setCategory('all')
  }
})

const types = ['Attack', 'Stamina', 'Defense', 'Starter Bundle', 'Launcher', 'Parts']
const tiers = ['S', 'A', 'B', 'C']

const list = computed(() => {
  let l = products.filtered
  if (selectedTypes.value.length) {
    l = l.filter(p => selectedTypes.value.includes(p.type))
  }
  if (selectedTiers.value.length) {
    l = l.filter(p => selectedTiers.value.includes(p.tier))
  }
  if (selectedSpin.value !== 'all') {
    l = l.filter(p => p.spin === selectedSpin.value || p.spin === 'mixed')
  }
  return l
})

const sortOptions = [
  { id: 'featured',   label: 'Featured' },
  { id: 'power',      label: 'Power ↓' },
  { id: 'price-asc',  label: 'Price ↑' },
  { id: 'price-desc', label: 'Price ↓' },
  { id: 'rating',     label: 'Top rated' },
  { id: 'newest',     label: 'Newest' }
]
const currentSort = computed(() => sortOptions.find(o => o.id === products.sort) || sortOptions[0])

function clearFilters() {
  products.reset()
  selectedTypes.value = []
  selectedTiers.value = []
  selectedSpin.value = 'all'
  router.push({ name: 'shop' })
}

function toggleType(t) {
  const i = selectedTypes.value.indexOf(t)
  if (i >= 0) selectedTypes.value.splice(i, 1)
  else selectedTypes.value.push(t)
}
function toggleTier(t) {
  const i = selectedTiers.value.indexOf(t)
  if (i >= 0) selectedTiers.value.splice(i, 1)
  else selectedTiers.value.push(t)
}

const tierColor = {
  S: '#fbbf24',
  A: '#a78bfa',
  B: '#60a5fa',
  C: '#94a3b8'
}

const activeFilterCount = computed(() =>
  selectedTypes.value.length + selectedTiers.value.length + (selectedSpin.value !== 'all' ? 1 : 0)
)
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <header class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="chip">Catalog</p>
        <h1 class="mt-2 font-display text-5xl text-white">All Beyblades</h1>
        <p class="mt-2 max-w-xl text-slate-400">{{ list.length }} products · Filtered live as you type.</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-secondary !py-2 !px-4 lg:hidden" @click="showFilters = !showFilters">
          {{ showFilters ? 'Hide' : 'Show' }} filters
          <span v-if="activeFilterCount" class="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-bold">{{ activeFilterCount }}</span>
        </button>
        <div class="relative">
          <button class="btn-secondary !py-2 !px-4" @click="sortOpen = !sortOpen">
            Sort: {{ currentSort.label }}
            <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"/></svg>
          </button>
          <transition name="dropdown">
            <div v-if="sortOpen" class="absolute right-0 z-10 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-storm-light shadow-card">
              <button
                v-for="o in sortOptions" :key="o.id"
                class="block w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
                :class="{ 'text-white bg-white/5': products.sort === o.id }"
                @click="products.setSort(o.id); sortOpen = false"
              >{{ o.label }}</button>
            </div>
          </transition>
        </div>
      </div>
    </header>

    <div class="grid gap-8 lg:grid-cols-[280px_1fr]">
      <!-- Filters -->
      <aside
        class="space-y-6 lg:sticky lg:top-24 lg:self-start"
        :class="!showFilters && 'hidden lg:block'"
      >
        <div class="card-surface p-5">
          <h3 class="font-display text-lg tracking-wide text-white">Search</h3>
          <div class="relative mt-3">
            <svg viewBox="0 0 20 20" fill="currentColor" class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg>
            <input
              :value="products.query"
              @input="products.setQuery($event.target.value)"
              type="search"
              placeholder="Valkyrie, L Drago..."
              class="input pl-9"
            />
          </div>
        </div>

        <div class="card-surface p-5">
          <h3 class="font-display text-lg tracking-wide text-white">Category</h3>
          <div class="mt-3 space-y-1">
            <button
              class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition"
              :class="products.activeCategory === 'all' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'"
              @click="products.setCategory('all')"
            >
              <span>All</span>
              <span class="text-xs text-slate-500">{{ products.items.length }}</span>
            </button>
            <button
              v-for="c in CATEGORIES" :key="c.id"
              class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition"
              :class="products.activeCategory === c.id ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'"
              @click="products.setCategory(c.id)"
            >
              <span>{{ c.name }}</span>
              <span class="text-xs text-slate-500">{{ products.items.filter(p => p.category === c.id).length }}</span>
            </button>
          </div>
        </div>

        <!-- Type filter -->
        <div class="card-surface p-5">
          <h3 class="font-display text-lg tracking-wide text-white">Type</h3>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="t in types" :key="t"
              class="rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest transition"
              :style="selectedTypes.includes(t) ? {
                background: TYPE_META[t].color + '22',
                borderColor: TYPE_META[t].color,
                color: TYPE_META[t].color,
                boxShadow: `0 0 10px ${TYPE_META[t].color}55`
              } : {
                background: 'transparent',
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#94a3b8'
              }"
              @click="toggleType(t)"
            >{{ TYPE_META[t].label }}</button>
          </div>
        </div>

        <!-- Tier filter -->
        <div class="card-surface p-5">
          <h3 class="font-display text-lg tracking-wide text-white">Tier</h3>
          <div class="mt-3 grid grid-cols-4 gap-2">
            <button
              v-for="t in tiers" :key="t"
              class="flex h-10 items-center justify-center rounded-lg font-display text-lg transition"
              :style="selectedTiers.includes(t) ? {
                background: `linear-gradient(135deg, ${tierColor[t]}, ${tierColor[t]}aa)`,
                color: '#0b1020',
                boxShadow: `0 0 12px ${tierColor[t]}80`
              } : {
                background: 'rgba(255,255,255,0.04)',
                color: '#94a3b8',
                border: '1px solid rgba(255,255,255,0.08)'
              }"
              @click="toggleTier(t)"
            >{{ t }}</button>
          </div>
        </div>

        <!-- Spin filter -->
        <div class="card-surface p-5">
          <h3 class="font-display text-lg tracking-wide text-white">Spin direction</h3>
          <div class="mt-3 grid grid-cols-3 gap-2">
            <button
              v-for="s in ['all', 'left', 'right']" :key="s"
              class="flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold uppercase tracking-widest transition"
              :style="selectedSpin === s ? {
                background: s === 'left' ? 'rgba(239,68,68,0.15)' : s === 'right' ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${s === 'left' ? '#ef4444' : s === 'right' ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`,
                color: s === 'left' ? '#fb7185' : s === 'right' ? '#60a5fa' : '#cbd5e1'
              } : {
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#94a3b8'
              }"
              @click="selectedSpin = s"
            >
              <SpinArrow :direction="s" :size="16" :spinning="false" />
              {{ s === 'all' ? 'All' : s }}
            </button>
          </div>
        </div>

        <!-- Price -->
        <div class="card-surface p-5">
          <h3 class="font-display text-lg tracking-wide text-white">Price</h3>
          <div class="mt-3 flex items-center gap-2 text-sm">
            <input
              type="number" min="0" :max="products.maxPrice" :value="products.priceMin"
              @input="products.setPriceRange(+$event.target.value, products.priceMax)"
              class="input !py-1.5"
            />
            <span class="text-slate-500">—</span>
            <input
              type="number" min="0" :max="products.maxPrice" :value="products.priceMax"
              @input="products.setPriceRange(products.priceMin, +$event.target.value)"
              class="input !py-1.5"
            />
          </div>
          <input
            type="range" min="0" :max="products.maxPrice" :value="products.priceMax"
            @input="products.setPriceRange(products.priceMin, +$event.target.value)"
            class="mt-3 w-full accent-rip-500"
          />
        </div>

        <button class="btn-ghost w-full !justify-center" @click="clearFilters">
          Reset all filters
          <span v-if="activeFilterCount" class="ml-1 text-accent-red">({{ activeFilterCount }})</span>
        </button>
      </aside>

      <!-- Results -->
      <div>
        <!-- Active filter chips -->
        <div v-if="activeFilterCount" class="mb-4 flex flex-wrap gap-2">
          <span
            v-for="t in selectedTypes" :key="'ft-'+t"
            class="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-widest"
            :style="{ borderColor: TYPE_META[t].color, color: TYPE_META[t].color, background: TYPE_META[t].color + '15' }"
          >
            <TypeBadge :type="t" size="sm" :glow="false" />
            <button @click="toggleType(t)" class="ml-1 opacity-60 hover:opacity-100">✕</button>
          </span>
          <span
            v-for="t in selectedTiers" :key="'tier-'+t"
            class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
            :style="{ background: tierColor[t] + '22', color: tierColor[t], border: `1px solid ${tierColor[t]}` }"
          >
            Tier {{ t }}
            <button @click="toggleTier(t)" class="ml-1 opacity-60 hover:opacity-100">✕</button>
          </span>
          <span
            v-if="selectedSpin !== 'all'"
            class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-widest"
            :style="{ background: selectedSpin === 'left' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)', color: selectedSpin === 'left' ? '#fb7185' : '#60a5fa', border: `1px solid ${selectedSpin === 'left' ? '#ef4444' : '#3b82f6'}` }"
          >
            <SpinArrow :direction="selectedSpin" :size="14" :spinning="false" />
            {{ selectedSpin }} spin
            <button @click="selectedSpin = 'all'" class="ml-1 opacity-60 hover:opacity-100">✕</button>
          </span>
        </div>

        <transition-group
          name="grid"
          tag="div"
          class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          <ProductCard
            v-for="(p, idx) in list"
            :key="p.id"
            :product="p"
            class="animate-fade-up"
            :style="{ animationDelay: (idx * 60) + 'ms' }"
          />
        </transition-group>

        <div v-if="!products.loaded" class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          <div v-for="n in 6" :key="n" class="h-[440px] rounded-3xl skeleton"></div>
        </div>

        <div v-else-if="!list.length" class="card-surface mt-6 p-12 text-center">
          <BeybladeSpinner :size="64" class="mx-auto opacity-50" />
          <p class="mt-4 font-display text-2xl text-white">No Beyblades match those filters.</p>
          <p class="mt-2 text-sm text-slate-400">Try a different category, or</p>
          <button class="btn-primary mt-4" @click="clearFilters">Reset filters</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.dropdown-enter-from,
.dropdown-leave-to { opacity: 0; transform: translateY(-6px); }

.grid-enter-active,
.grid-leave-active { transition: all 0.4s ease; }
.grid-enter-from,
.grid-leave-to { opacity: 0; transform: scale(0.95) translateY(10px); }
.grid-leave-active { position: absolute; }
</style>
