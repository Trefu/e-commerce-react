<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import BeybladeSpinner from '@/components/ui/BeybladeSpinner.vue'

const route = useRoute()
const router = useRouter()
const orders = useOrdersStore()
const auth = useAuthStore()

const dots = ref([])
onMounted(() => {
  const colors = ['#fbbf24', '#6366f1', '#22c55e', '#ef4444', '#38bdf8']
  for (let i = 0; i < 50; i++) {
    dots.value.push({
      left: Math.random() * 100 + '%',
      delay: Math.random() * 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      tx: (Math.random() - 0.5) * 220 + 'px',
      size: 4 + Math.random() * 8
    })
  }
})

const order = computed(() => orders.byId(route.params.id))
</script>

<template>
  <div>
  <div v-if="!order" class="mx-auto max-w-2xl px-4 py-24 text-center">
    <p class="font-display text-3xl text-white">Order not found.</p>
    <RouterLink to="/shop" class="btn-primary mt-6 inline-flex">Back to shop</RouterLink>
  </div>

  <div v-else class="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
    <div class="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-rip-700/40 via-storm to-storm-light p-8 text-center sm:p-12">
      <span v-for="(d, i) in dots" :key="i"
        class="confetti-dot"
        :style="{ left: d.left, top: '-10px', background: d.color, width: d.size + 'px', height: d.size + 'px', animationDelay: d.delay + 's', '--tx': d.tx }"
      ></span>
      <div class="relative mx-auto h-32 w-32">
        <BeybladeSpinner :size="128" speed="fast" />
      </div>
      <h1 class="relative mt-6 font-display text-5xl text-white">LET IT RIP!</h1>
      <p class="relative mt-2 text-slate-300">Your order has been confirmed and is heading to the stadium.</p>
      <p class="relative mt-6 font-display text-2xl text-rip-200">{{ order.id }}</p>

      <div class="relative mt-8 grid gap-4 sm:grid-cols-3">
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs uppercase tracking-widest text-slate-400">Email</p>
          <p class="mt-1 text-white">{{ order.customer.email }}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs uppercase tracking-widest text-slate-400">Shipping</p>
          <p class="mt-1 text-white capitalize">{{ order.shipping }}</p>
        </div>
        <div class="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p class="text-xs uppercase tracking-widest text-slate-400">Total</p>
          <p class="mt-1 text-white">${{ order.total.toFixed(2) }}</p>
        </div>
      </div>

      <div class="relative mt-8 text-left">
        <h2 class="font-display text-xl text-white">Order timeline</h2>
        <ol class="mt-4 space-y-3">
          <li v-for="(t, i) in order.timeline" :key="i" class="flex items-start gap-3">
            <span class="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2"
              :class="t.done ? 'border-accent-green bg-accent-green/20 text-accent-green' : 'border-white/10 text-slate-500'">
              {{ t.done ? '✓' : i + 1 }}
            </span>
            <div>
              <p :class="t.done ? 'text-white' : 'text-slate-400'" class="font-display">{{ t.label }}</p>
              <p class="text-xs text-slate-500">{{ t.at ? new Date(t.at).toLocaleString() : 'Pending' }}</p>
            </div>
          </li>
        </ol>
      </div>

      <div class="relative mt-10 flex flex-wrap justify-center gap-3">
        <button class="btn-secondary" @click="orders.advance(order.id)" :disabled="order.timeline.every(t => t.done)">Advance status (demo)</button>
        <RouterLink v-if="auth.user" :to="`/orders`" class="btn-ghost">My orders</RouterLink>
        <RouterLink to="/shop" class="btn-primary">Continue shopping</RouterLink>
      </div>
    </div>

    <div class="mt-10">
      <h3 class="font-display text-2xl text-white">Items in this shipment</h3>
      <div class="mt-4 space-y-3">
        <article v-for="i in order.items" :key="i.id" class="card-surface flex items-center gap-4 p-4">
          <div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-stadium">
            <img :src="i.image" class="absolute inset-0 m-auto h-16 w-16 object-contain" />
          </div>
          <div class="flex-1">
            <p class="font-display text-lg text-white">{{ i.title }}</p>
            <p class="text-sm text-slate-400">Qty {{ i.quantity }}</p>
          </div>
          <p class="font-display text-xl text-white">${{ i.subtotal.toFixed(2) }}</p>
        </article>
      </div>
    </div>
  </div>
  </div>
</template>
