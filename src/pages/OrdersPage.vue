<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'

const orders = useOrdersStore()
const auth = useAuthStore()

const list = computed(() => orders.forUser(auth.user?.id))
</script>

<template>
  <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
    <header class="mb-8">
      <p class="chip">Account</p>
      <h1 class="mt-2 font-display text-5xl text-white">My orders</h1>
      <p class="mt-2 text-slate-400">Signed in as <span class="text-white">{{ auth.user?.email }}</span></p>
    </header>

    <div v-if="!list.length" class="card-surface p-12 text-center">
      <p class="font-display text-2xl text-white">No orders yet.</p>
      <p class="mt-2 text-slate-400">Your future wins will live here.</p>
      <RouterLink to="/shop" class="btn-primary mt-6 inline-flex">Browse shop</RouterLink>
    </div>

    <div v-else class="space-y-4">
      <RouterLink
        v-for="(o, i) in list" :key="o.id"
        :to="`/order/${o.id}`"
        class="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center transition hover:-translate-y-0.5 hover:border-rip-400/50 hover:shadow-glow animate-fade-up"
        :style="{ animationDelay: (i * 60) + 'ms' }"
      >
        <div class="flex -space-x-3">
          <div v-for="(it, j) in o.items.slice(0, 3)" :key="j" class="relative h-14 w-14 overflow-hidden rounded-2xl ring-2 ring-storm ring-stadium">
            <img :src="it.image" class="absolute inset-0 m-auto h-12 w-12 object-contain" />
          </div>
          <div v-if="o.items.length > 3" class="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-xs text-slate-300 ring-2 ring-storm">+{{ o.items.length - 3 }}</div>
        </div>
        <div class="flex-1">
          <p class="font-display text-lg text-white">{{ o.id }}</p>
          <p class="text-xs text-slate-400">{{ new Date(o.createdAt).toLocaleString() }} · {{ o.items.length }} items</p>
        </div>
        <div class="text-right">
          <p class="font-display text-xl text-white">${{ o.total.toFixed(2) }}</p>
          <span class="text-xs uppercase tracking-widest"
            :class="{
              'text-accent-green': o.status === 'delivered',
              'text-accent-gold': o.status === 'processing' || o.status === 'preparing',
              'text-accent-blue': o.status === 'shipping'
            }">{{ o.status }}</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
