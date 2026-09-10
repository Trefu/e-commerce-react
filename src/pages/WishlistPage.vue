<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useWishlistStore } from '@/stores/wishlist'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import ProductCard from '@/components/ProductCard.vue'
import BeybladeSpinner from '@/components/ui/BeybladeSpinner.vue'

const wishlist = useWishlistStore()
const products = useProductsStore()
const cart = useCartStore()

const items = computed(() =>
  wishlist.items
    .map(id => products.byId(id))
    .filter(Boolean)
)
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <header class="mb-8">
      <p class="chip">Wishlist</p>
      <h1 class="mt-2 font-display text-5xl text-white">Saved for battle</h1>
      <p class="mt-2 text-slate-400">{{ items.length }} Beyblades ready to launch.</p>
    </header>

    <div v-if="!products.loaded" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="n in 3" :key="n" class="h-[420px] rounded-3xl skeleton"></div>
    </div>

    <div v-else-if="!items.length" class="card-surface p-12 text-center">
      <BeybladeSpinner :size="80" class="mx-auto opacity-50" />
      <p class="mt-6 font-display text-3xl text-white">No Beyblades saved yet.</p>
      <p class="mt-2 text-slate-400">Tap the heart icon on any product to add it here.</p>
      <RouterLink to="/shop" class="btn-primary mt-6 inline-flex">Browse shop</RouterLink>
    </div>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <ProductCard v-for="(p, i) in items" :key="p.id" :product="p" class="animate-fade-up" :style="{ animationDelay: (i * 80) + 'ms' }" />
    </div>

    <div v-if="items.length" class="mt-10 flex justify-center">
      <button class="btn-ghost !text-accent-red" @click="wishlist.items = []; wishlist.persist()">Clear wishlist</button>
    </div>
  </div>
</template>
