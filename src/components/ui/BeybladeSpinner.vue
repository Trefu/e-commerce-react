<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: { type: Number, default: 96 },
  speed: { type: String, default: 'normal' } // slow | normal | fast | wobble
})

const speedClass = computed(() => ({
  slow: 'animate-spin-slow',
  fast: 'animate-spin-fast',
  wobble: 'animate-spin-wobble',
  normal: 'animate-spin-slow'
}[props.speed]))
</script>

<template>
  <div
    class="relative inline-flex items-center justify-center"
    :style="{ width: size + 'px', height: size + 'px' }"
    role="status"
    aria-label="Loading"
  >
    <!-- Outer ring (stadium) -->
    <div class="absolute inset-0 rounded-full ring-2 ring-rip-500/40"></div>
    <!-- Streak layer -->
    <div class="absolute inset-1 rounded-full streak" :class="speedClass"></div>
    <!-- Core -->
    <div class="absolute inset-[28%] rounded-full bg-gradient-to-br from-rip-300 to-rip-700 shadow-glow"></div>
    <!-- Center bolt -->
    <div class="absolute h-[14%] w-[14%] rounded-full bg-accent-gold shadow-[0_0_12px_rgba(251,191,36,0.8)]"></div>
  </div>
</template>
