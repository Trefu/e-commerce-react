<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import StarRating from '@/components/ui/StarRating.vue'
import TypeBadge from '@/components/ui/TypeBadge.vue'
import SpinArrow from '@/components/ui/SpinArrow.vue'

const props = defineProps({
  product: { type: Object, required: true }
})

const cart = useCartStore()
const wishlist = useWishlistStore()
const router = useRouter()

const tilt = ref({ rx: 0, ry: 0, tx: 0, ty: 0, active: false })
const card = ref(null)
const isWish = computed(() => wishlist.has(props.product.id))

function onMove(e) {
  if (!card.value) return
  const rect = card.value.getBoundingClientRect()
  const x = (e.clientX - rect.left) / rect.width - 0.5
  const y = (e.clientY - rect.top) / rect.height - 0.5
  tilt.value = {
    rx: -y * 10,
    ry: x * 12,
    tx: x * 8,
    ty: y * 8,
    active: true
  }
}

function onLeave() {
  tilt.value = { rx: 0, ry: 0, tx: 0, ty: 0, active: false }
}

function quickAdd(e) {
  e.preventDefault(); e.stopPropagation()
  cart.add(props.product, 1)
}

function toggleWish(e) {
  e.preventDefault(); e.stopPropagation()
  wishlist.toggle(props.product.id)
}

function open() {
  router.push({ name: 'product', params: { id: props.product.id } })
}

const colors = {
  red:    { ring: 'from-accent-red/40 to-rose-500/10',   text: 'text-accent-red' },
  blue:   { ring: 'from-accent-blue/40 to-sky-500/10',   text: 'text-accent-blue' },
  green:  { ring: 'from-accent-green/40 to-emerald-500/10', text: 'text-accent-green' },
  purple: { ring: 'from-rip-500/40 to-fuchsia-500/10',   text: 'text-rip-300' },
  mixed:  { ring: 'from-rip-500/40 to-accent-gold/20',    text: 'text-accent-gold' },
  black:  { ring: 'from-white/30 to-white/5',            text: 'text-white' }
}
const theme = computed(() => colors[props.product.color] || colors.purple)

const tierColors = {
  S: '#fbbf24',
  A: '#a78bfa',
  B: '#60a5fa',
  C: '#94a3b8'
}
const tierColor = computed(() => tierColors[props.product.tier] || '#94a3b8')
</script>

<template>
  <article
    ref="card"
    class="tilt-card group relative h-[440px] w-full max-w-sm cursor-pointer"
    @mousemove="onMove"
    @mouseleave="onLeave"
    @click="open"
  >
    <div
      class="tilt-inner relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-card transition-transform duration-300"
      :style="{
        transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(0)`
      }"
    >
      <!-- Stadium gradient halo -->
      <div
        class="absolute inset-0 bg-gradient-to-br opacity-90"
        :class="theme.ring"
      />

      <!-- Tier badge (top-left) -->
      <div
        v-if="product.tier"
        class="absolute left-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl font-display text-lg text-storm"
        :style="{
          background: `linear-gradient(135deg, ${tierColor}, ${tierColor}aa)`,
          boxShadow: `0 0 16px ${tierColor}80`
        }"
      >{{ product.tier }}</div>

      <!-- Wishlist (top-right) -->
      <button
        class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-storm/70 text-slate-200 backdrop-blur transition hover:text-accent-red active:scale-90"
        :class="isWish && 'text-accent-red animate-pop-in'"
        :style="product.tier ? { left: 'auto', right: '0.75rem' } : {}"
        @click="toggleWish"
        aria-label="Add to wishlist"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
        </svg>
      </button>

      <!-- Badge (next to wishlist when tier present) -->
      <span
        v-if="product.badge && !product.tier"
        class="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-accent-gold to-yellow-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-storm"
      >{{ product.badge }}</span>

      <span
        v-else-if="product.badge"
        class="absolute right-14 top-4 z-10 rounded-full bg-gradient-to-r from-accent-gold to-yellow-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-storm"
      >{{ product.badge }}</span>

      <!-- Stadium ring -->
      <div class="absolute inset-x-6 top-6 h-56 overflow-hidden rounded-2xl ring-stadium">
        <div class="streak absolute inset-2 opacity-80" :class="tilt.active ? 'animate-spin-fast' : 'animate-spin-slow'"></div>
        <img
          :src="product.images[0]"
          :alt="product.title"
          class="absolute inset-0 m-auto h-44 w-44 object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 will-change-transform"
          :style="{ transform: `translate3d(${tilt.tx}px, ${tilt.ty}px, 0) rotate(${-tilt.ry * 2}deg)` }"
          loading="lazy"
        />
        <div class="absolute bottom-2 right-3 rounded-full bg-storm/70 px-2 py-0.5 text-[10px] uppercase tracking-widest text-slate-300 backdrop-blur">
          {{ product.series }}
        </div>
        <div class="absolute left-2 top-2">
          <SpinArrow :direction="product.spin" :size="22" />
        </div>
      </div>

      <!-- Info -->
      <div class="absolute inset-x-0 bottom-0 p-5">
        <div class="flex items-center gap-2">
          <TypeBadge :type="product.type" size="sm" :glow="false" />
          <span class="text-[10px] uppercase tracking-widest text-slate-400">{{ product.weight }}</span>
          <span v-if="product.power" class="ml-auto font-display text-xs text-accent-gold">{{ product.power }} PWR</span>
        </div>
        <h3 class="mt-1.5 font-display text-xl tracking-wide text-white line-clamp-1">{{ product.title }}</h3>
        <div class="mt-1 flex items-center gap-2 text-xs text-slate-400">
          <StarRating :value="product.rating" :size="12" />
          <span>{{ product.rating.toFixed(1) }} ({{ product.reviews }})</span>
        </div>
        <div class="mt-3 flex items-end justify-between">
          <div>
            <p class="font-display text-2xl text-white">${{ product.price.toFixed(2) }}</p>
            <p class="text-[10px] uppercase tracking-widest" :class="product.stock > 0 ? 'text-accent-green' : 'text-accent-red'">
              {{ product.stock > 0 ? `${product.stock} in stock` : 'Out of stock' }}
            </p>
          </div>
          <button
            class="btn-primary !py-2 !px-4 !text-xs"
            @click.stop="quickAdd"
            :disabled="product.stock <= 0"
            :class="product.stock <= 0 && '!bg-slate-600 !text-slate-300 !shadow-none cursor-not-allowed'"
          >
            + Launch
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
