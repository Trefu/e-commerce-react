<script setup>
import { computed } from 'vue'

const props = defineProps({
  rate: { type: Number, default: 0 }, // 0..1
  size: { type: Number, default: 64 },
  color: { type: String, default: '#6366f1' }
})

const circumference = computed(() => 2 * Math.PI * (props.size / 2 - 4))
const offset = computed(() => circumference.value * (1 - Math.min(Math.max(props.rate, 0), 1)))
</script>

<template>
  <div class="relative inline-flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="-rotate-90">
      <circle
        :cx="size/2" :cy="size/2" :r="size/2 - 4"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        stroke-width="4"
      />
      <circle
        :cx="size/2" :cy="size/2" :r="size/2 - 4"
        fill="none"
        :stroke="color"
        stroke-width="4"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        class="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
    <span class="absolute font-display text-lg text-white">{{ Math.round(rate * 100) }}%</span>
  </div>
</template>
