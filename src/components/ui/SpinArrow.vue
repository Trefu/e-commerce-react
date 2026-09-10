<script setup>
const props = defineProps({
  direction: { type: String, default: 'right' }, // left | right | mixed
  size: { type: Number, default: 20 },
  spinning: { type: Boolean, default: false },
  label: { type: Boolean, default: false }
})
</script>

<template>
  <span class="inline-flex items-center gap-2 align-middle">
    <!-- RIGHT (clockwise spin) — proven lucide-style circular arrow -->
    <svg
      v-if="direction === 'right'"
      :width="size" :height="size" viewBox="0 0 24 24"
      :class="spinning ? 'animate-spin-slow' : ''"
      class="text-rip-300"
      fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"
      aria-label="Right (clockwise) spin"
    >
      <!-- 3/4 arc starting at the right side, sweeping clockwise back up -->
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      <!-- Arrowhead at top-right corner showing clockwise direction -->
      <path d="M21 3v6h-6" />
    </svg>

    <!-- LEFT (counter-clockwise spin) — mirror -->
    <svg
      v-else-if="direction === 'left'"
      :width="size" :height="size" viewBox="0 0 24 24"
      :class="spinning ? 'animate-spin-slow' : ''"
      class="text-rip-300"
      fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"
      aria-label="Left (counter-clockwise) spin"
    >
      <path d="M3 12a9 9 0 1 0 6.219-8.56" />
      <path d="M3 3v6h6" />
    </svg>

    <!-- MIXED — two opposing arcs (yin-yang rotation) -->
    <svg
      v-else
      :width="size" :height="size" viewBox="0 0 24 24"
      :class="spinning ? 'animate-spin-slow' : ''"
      class="text-rip-300"
      fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"
      aria-label="Dual spin"
    >
      <!-- Top arc, clockwise -->
      <path d="M3 12a9 9 0 0 1 15.5-6" />
      <path d="M18.5 2.5 18.5 7.5 13.5 7.5" />
      <!-- Bottom arc, counter-clockwise -->
      <path d="M21 12a9 9 0 0 1-15.5 6" />
      <path d="M5.5 21.5 5.5 16.5 10.5 16.5" />
    </svg>

    <span v-if="label" class="text-[10px] uppercase tracking-widest text-slate-400">
      {{ direction === 'mixed' ? 'Dual spin' : direction + ' spin' }}
    </span>
  </span>
</template>
