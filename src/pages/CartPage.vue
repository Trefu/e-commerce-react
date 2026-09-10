<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useUiStore } from '@/stores/ui'
import { getProductById } from '@/data/products'
import BeybladeSpinner from '@/components/ui/BeybladeSpinner.vue'
import RevealOnScroll from '@/components/ui/RevealOnScroll.vue'
import TypeBadge from '@/components/ui/TypeBadge.vue'
import SpinArrow from '@/components/ui/SpinArrow.vue'

const cart = useCartStore()
const wishlist = useWishlistStore()
const ui = useUiStore()
const promoInput = ref('')
const launching = ref(false)

// Always include cart items, even if product lookup fails (use fallback).
// Only drop items that are completely empty.
const detailed = computed(() => cart.items
  .map(i => {
    const product = getProductById(i.id)
    if (product) return { ...i, ...product, _stale: false }
    return {
      id: i.id,
      title: i.title || `Item ${String(i.id).slice(-6)}`,
      images: i.images?.length ? i.images : ['/beyblades/hero.svg'],
      image: i.image || '/beyblades/hero.svg',
      price: Number(i.price) || 0,
      type: i.type || 'Balancer',
      spin: i.spin || 'right',
      weight: i.weight || '—',
      color: i.color || 'purple',
      power: Number(i.power) || 0,
      series: i.series || '',
      quantity: i.quantity,
      _stale: true
    }
  })
)

// Aggregate power of all beys in cart
const arenaPower = computed(() =>
  detailed.value.reduce((sum, item) => sum + ((item.power || 0) * item.quantity), 0)
)

const arenaSpin = computed(() => {
  const counts = { left: 0, right: 0, mixed: 0 }
  detailed.value.forEach(i => { counts[i.spin] = (counts[i.spin] || 0) + i.quantity })
  const max = Math.max(...Object.values(counts))
  return Object.keys(counts).find(k => counts[k] === max) || 'mixed'
})

const staleCount = computed(() => detailed.value.filter(i => i._stale).length)

function repairCart() {
  // Drop items whose product cannot be resolved from the catalog
  cart.items = cart.items.filter(i => getProductById(i.id))
  cart.persist()
  ui.toast({ title: 'Cart repaired', content: 'Stale items removed.', color: 'green' })
}

function apply() {
  if (promoInput.value.trim()) cart.applyPromo(promoInput.value)
}

function ripCheckout() {
  launching.value = true
  setTimeout(() => launching.value = false, 1200)
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <header class="mb-8">
      <p class="chip">Your arena</p>
      <h1 class="mt-2 font-display text-5xl text-white">Cart</h1>
      <p class="mt-2 text-slate-400">{{ cart.count }} items · Free shipping over $75</p>
    </header>

    <div v-if="!detailed.length" class="card-surface p-12 text-center">
      <div class="relative mx-auto h-32 w-32">
        <BeybladeSpinner :size="128" speed="wobble" />
      </div>
      <p class="mt-6 font-display text-3xl text-white">Your stadium is empty.</p>
      <p class="mt-2 text-slate-400">Pick a combo to launch your first battle.</p>
      <RouterLink to="/shop" class="btn-primary mt-6 inline-flex">⚡ Discover Beyblades</RouterLink>
    </div>

    <div v-else-if="staleCount > 0 && staleCount === detailed.length" class="card-surface p-8 text-center">
      <p class="font-display text-2xl text-white">Catalog updated — your cart needs a refresh.</p>
      <p class="mt-2 text-slate-400">{{ staleCount }} item(s) no longer match the current catalog.</p>
      <div class="mt-5 flex flex-wrap justify-center gap-3">
        <button class="btn-primary" @click="repairCart">⚡ Repair cart</button>
        <RouterLink to="/shop" class="btn-secondary">Browse shop</RouterLink>
      </div>
    </div>

    <div v-else class="grid gap-8 lg:grid-cols-[1fr_400px]">
      <!-- Items -->
      <div class="space-y-4">
        <!-- Arena stats banner -->
        <div class="relative overflow-hidden rounded-2xl border border-rip-500/30 bg-gradient-to-r from-rip-700/30 via-storm-light/40 to-storm p-5">
          <div class="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rip-500/30 blur-3xl"></div>
          <div class="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-accent-gold/20 blur-3xl"></div>
          <div class="relative flex flex-wrap items-center gap-6">
            <div>
              <p class="text-[10px] uppercase tracking-[0.3em] text-slate-400">Arena total</p>
              <p class="font-display text-3xl text-white">{{ arenaPower.toLocaleString() }} <span class="text-sm text-accent-gold">PWR</span></p>
            </div>
            <div class="h-12 w-px bg-white/10"></div>
            <div>
              <p class="text-[10px] uppercase tracking-[0.3em] text-slate-400">Dom. spin</p>
              <SpinArrow :direction="arenaSpin" :size="32" :label="true" />
            </div>
            <div class="h-12 w-px bg-white/10"></div>
            <div>
              <p class="text-[10px] uppercase tracking-[0.3em] text-slate-400">Beys in arena</p>
              <p class="font-display text-3xl text-white">{{ cart.count }}</p>
            </div>
            <div class="ml-auto flex -space-x-3">
              <div
                v-for="(item, i) in detailed.slice(0, 5)" :key="item.id + '-arena'"
                class="relative h-12 w-12 overflow-hidden rounded-full border-2 border-storm-light ring-stadium"
                :style="{ zIndex: 10 - i }"
              >
                <div class="streak absolute inset-1 opacity-60 animate-spin-slow"></div>
                <img :src="item.images?.[0] || '/beyblades/hero.svg'" :alt="item.title" class="absolute inset-0 m-auto h-10 w-10 object-contain" />
              </div>
              <div v-if="detailed.length > 5" class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-storm-light bg-storm font-display text-xs text-slate-400">+{{ detailed.length - 5 }}</div>
            </div>
          </div>
        </div>

        <transition-group name="cart" tag="div" class="space-y-4">
          <article
            v-for="(item, i) in detailed" :key="item.id"
            class="card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-center animate-fade-up"
            :style="{ animationDelay: (i * 60) + 'ms' }"
          >
            <div class="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl ring-stadium">
              <div class="streak absolute inset-2 opacity-50 animate-spin-slow"></div>
              <img :src="item.images?.[0] || '/beyblades/hero.svg'" :alt="item.title" class="absolute inset-0 m-auto h-24 w-24 object-contain" />
            </div>
            <div class="flex-1 min-w-0">
              <RouterLink :to="`/product/${item.id}`" class="font-display text-xl text-white hover:text-rip-200">{{ item.title }}</RouterLink>
              <div class="mt-1 flex flex-wrap items-center gap-2">
                <TypeBadge :type="item.type" size="sm" :glow="false" />
                <SpinArrow :direction="item.spin" :size="18" :spinning="false" />
                <span class="text-[10px] uppercase tracking-widest text-slate-500">· {{ item.weight }}</span>
                <span v-if="item.power" class="text-[10px] font-bold uppercase tracking-widest text-accent-gold">· {{ item.power }} PWR</span>
              </div>
              <div class="mt-3 flex items-center gap-3">
                <div class="flex items-center overflow-hidden rounded-full border border-white/10 bg-white/5">
                  <button class="px-3 py-1 text-lg" @click="cart.decrement(item.id)">−</button>
                  <span class="min-w-[2rem] text-center font-display text-lg text-white">{{ item.quantity }}</span>
                  <button class="px-3 py-1 text-lg" @click="cart.increment(item.id)">+</button>
                </div>
                <button class="btn-ghost !text-xs" @click="wishlist.toggle(item.id)" :class="wishlist.has(item.id) && '!text-accent-red'">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  {{ wishlist.has(item.id) ? 'Wishlisted' : 'Wishlist' }}
                </button>
                <button class="btn-ghost !text-xs !text-accent-red" @click="cart.remove(item.id)">Remove</button>
              </div>
            </div>
            <div class="text-right">
              <p class="font-display text-2xl text-white">${{ (item.price * item.quantity).toFixed(2) }}</p>
              <p class="text-xs text-slate-400">${{ item.price.toFixed(2) }} each</p>
            </div>
          </article>
        </transition-group>

        <div class="flex items-center justify-between">
          <RouterLink to="/shop" class="btn-ghost">← Continue shopping</RouterLink>
          <button class="btn-ghost !text-accent-red" @click="cart.clear()">Clear arena</button>
        </div>
      </div>

      <!-- Summary -->
      <aside class="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div class="card-surface p-6">
          <h3 class="font-display text-2xl text-white">Order summary</h3>
          <dl class="mt-4 space-y-2 text-sm">
            <div class="flex justify-between"><dt class="text-slate-400">Subtotal</dt><dd class="text-white">${{ cart.subtotal.toFixed(2) }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-400">Shipping</dt><dd class="text-white">{{ cart.shippingCost === 0 ? 'Free' : '$' + cart.shippingCost.toFixed(2) }}</dd></div>
            <div v-if="cart.discount" class="flex justify-between text-accent-green"><dt>Discount ({{ cart.promo }})</dt><dd>−${{ cart.discount.toFixed(2) }}</dd></div>
          </dl>
          <div class="rip-divider my-4"></div>
          <div class="flex justify-between"><dt class="font-display text-xl text-white">Total</dt><dd class="font-display text-2xl text-white">${{ cart.total.toFixed(2) }}</dd></div>

          <div class="mt-4 space-y-2">
            <label class="label">Shipping</label>
            <div class="grid grid-cols-2 gap-2">
              <button class="rounded-xl border px-3 py-2 text-left text-xs transition"
                :class="cart.shipping === 'standard' ? 'border-rip-400 bg-rip-500/10 text-white' : 'border-white/10 text-slate-300 hover:bg-white/5'"
                @click="cart.setShipping('standard')">
                <span class="block font-semibold">Standard</span>
                <span class="block text-slate-400">$4.99 · 3–5 days</span>
              </button>
              <button class="rounded-xl border px-3 py-2 text-left text-xs transition"
                :class="cart.shipping === 'express' ? 'border-rip-400 bg-rip-500/10 text-white' : 'border-white/10 text-slate-300 hover:bg-white/5'"
                @click="cart.setShipping('express')">
                <span class="block font-semibold">Express</span>
                <span class="block text-slate-400">$9.99 · 24–48h</span>
              </button>
            </div>
          </div>

          <div class="mt-4">
            <label class="label">Promo code</label>
            <div class="flex gap-2">
              <input v-model="promoInput" class="input" placeholder="LETITRIP10" @keyup.enter="apply" />
              <button class="btn-secondary" @click="apply">Apply</button>
            </div>
            <p class="mt-2 text-xs text-slate-500">Try <kbd class="rounded bg-white/10 px-1">LETITRIP10</kbd>, <kbd class="rounded bg-white/10 px-1">STORM20</kbd> or <kbd class="rounded bg-white/10 px-1">BLADE5</kbd></p>
          </div>

          <RouterLink
            to="/checkout"
            class="btn-primary relative mt-6 w-full !py-3.5 !text-base overflow-hidden"
            @click="ripCheckout"
          >
            <span class="inline-flex items-center gap-2 transition" :class="launching && 'opacity-0'">
              ⚡ Launch to checkout
            </span>
            <transition name="rip">
              <span v-if="launching" class="absolute inset-0 flex items-center justify-center font-display text-lg tracking-widest text-white">
                LET IT RIP!
              </span>
            </transition>
          </RouterLink>
          <p class="mt-2 text-center text-[10px] uppercase tracking-widest text-slate-500">Secure checkout · 256-bit SSL</p>
        </div>

        <RevealOnScroll>
          <div class="card-surface p-5 text-sm text-slate-300">
            <p class="font-display text-lg text-white">Bundle & save</p>
            <p class="mt-1 text-slate-400">Add a launcher to your cart and unlock free express shipping automatically.</p>
          </div>
        </RevealOnScroll>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.cart-enter-active,
.cart-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.cart-enter-from { opacity: 0; transform: translateX(40px); }
.cart-leave-to { opacity: 0; transform: translateX(-40px); }
.cart-move { transition: transform 0.4s ease; }

.rip-enter-active, .rip-leave-active { transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
.rip-enter-from { opacity: 0; transform: scale(0.5); }
.rip-leave-to { opacity: 0; transform: scale(1.5); }
</style>
