<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import TypeBadge from './TypeBadge.vue'
import SpinArrow from './SpinArrow.vue'

const props = defineProps({
  tiers: { type: Object, required: true },
  // tiers = { S: [products], A: [...], B: [...], C: [...] }
})

const order = ['S', 'A', 'B', 'C']
const tierStyles = {
  S: { color: '#fbbf24', label: 'GOD TIER',     glow: 'rgba(251,191,36,0.45)' },
  A: { color: '#a78bfa', label: 'TOP TIER',     glow: 'rgba(167,139,250,0.35)' },
  B: { color: '#60a5fa', label: 'SOLID',        glow: 'rgba(96,165,250,0.30)' },
  C: { color: '#94a3b8', label: 'COLLECTOR',    glow: 'rgba(148,163,184,0.20)' }
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="t in order"
      :key="t"
      class="relative"
    >
      <div
        class="absolute -left-3 top-0 z-10 flex h-full w-1 rounded-full"
        :style="{ background: `linear-gradient(180deg, ${tierStyles[t].color}, ${tierStyles[t].color}33)` }"
      ></div>
      <div
        class="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
        :style="{ boxShadow: `inset 0 1px 0 ${tierStyles[t].glow}` }"
      >
        <header class="flex items-center gap-4 px-4 py-3 sm:px-6">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-2xl text-storm"
            :style="{ background: `linear-gradient(135deg, ${tierStyles[t].color}, ${tierStyles[t].color}88)`, boxShadow: `0 0 16px ${tierStyles[t].glow}` }"
          >{{ t }}</div>
          <div class="flex-1">
            <p class="font-display text-base tracking-widest text-white">{{ tierStyles[t].label }}</p>
            <p class="text-xs text-slate-400">{{ tiers[t]?.length || 0 }} beys in this tier</p>
          </div>
          <span
            class="hidden sm:inline-block h-1 flex-1 rounded-full"
            :style="{ background: `linear-gradient(90deg, ${tierStyles[t].color}55, transparent)` }"
          ></span>
        </header>

        <div class="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 xl:grid-cols-4">
          <RouterLink
            v-for="p in (tiers[t] || [])"
            :key="p.id"
            :to="`/product/${p.id}`"
            class="group relative flex items-center gap-3 rounded-xl border border-white/5 bg-storm/40 p-3 transition hover:-translate-y-0.5 hover:border-white/20"
          >
            <div class="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-stadium">
              <div class="streak absolute inset-1 opacity-60 animate-spin-slow"></div>
              <img :src="p.images[0]" :alt="p.title" class="absolute inset-0 m-auto h-12 w-12 object-contain" loading="lazy" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-white group-hover:text-rip-200">{{ p.title }}</p>
              <div class="mt-1 flex items-center gap-2">
                <TypeBadge :type="p.type" size="sm" :glow="false" />
                <SpinArrow :direction="p.spin" :size="20" :spinning="false" />
              </div>
            </div>
            <div class="text-right">
              <p class="font-display text-sm text-white tabular-nums" :style="{ color: tierStyles[t].color }">{{ p.power }}</p>
              <p class="text-[9px] uppercase tracking-widest text-slate-500">PWR</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
