<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  value: { type: Number, default: 8000 },
  max: { type: Number, default: 12000 },
  label: { type: String, default: 'POWER' },
  size: { type: Number, default: 140 },
  unit: { type: String, default: 'RPM' },
  color: { type: String, default: '#fbbf24' },
  showLabel: { type: Boolean, default: true }
})

// animated needle
const animated = ref(0)
function tween(from, to, ms = 900) {
  const start = performance.now()
  function step(t) {
    const p = Math.min((t - start) / ms, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    animated.value = from + (to - from) * eased
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
watch(() => props.value, (v, prev = 0) => tween(prev, v), { immediate: true })

const pct = computed(() => Math.min(animated.value / props.max, 1))
const angle = computed(() => -90 + pct.value * 180)
const arcLen = computed(() => Math.round(pct.value * 100) + '%')
const formatted = computed(() => Math.round(animated.value).toLocaleString())
</script>

<template>
  <div class="inline-flex flex-col items-center gap-2">
    <div
      class="relative"
      :style="{ width: size + 'px', height: (size / 2 + 14) + 'px' }"
    >
      <!-- arc track -->
      <svg
        :viewBox="`0 0 100 55`"
        class="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient :id="`pg-${label}`" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" :stop-color="color" stop-opacity="0.4" />
            <stop offset="100%" :stop-color="color" />
          </linearGradient>
        </defs>
        <path d="M 5 50 A 45 45 0 0 1 95 50" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="6" stroke-linecap="round"/>
        <path
          d="M 5 50 A 45 45 0 0 1 95 50"
          fill="none"
          :stroke="`url(#pg-${label})`"
          stroke-width="6"
          stroke-linecap="round"
          :stroke-dasharray="arcLen"
          style="filter: drop-shadow(0 0 6px currentColor);"
        />
      </svg>
      <!-- needle -->
      <div
        class="absolute left-1/2 bottom-0 origin-bottom transition-transform duration-300 ease-out"
        :style="{ transform: `translateX(-50%) rotate(${angle}deg)` }"
      >
        <div
          class="h-[42%] w-0.5 rounded-full"
          :style="{ background: `linear-gradient(to top, transparent, ${color})`, boxShadow: `0 0 6px ${color}` }"
        ></div>
      </div>
      <!-- center pivot -->
      <span
        class="absolute left-1/2 bottom-0 h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full"
        :style="{ background: color, boxShadow: `0 0 10px ${color}` }"
      ></span>
      <!-- value label -->
      <div class="absolute inset-x-0 bottom-2 text-center">
        <p class="font-display text-2xl text-white leading-none tabular-nums" :style="{ textShadow: `0 0 10px ${color}80` }">
          {{ formatted }}
        </p>
      </div>
    </div>
    <p
      v-if="showLabel"
      class="text-[10px] font-bold uppercase tracking-[0.3em]"
      :style="{ color }"
    >{{ label }} · {{ unit }}</p>
  </div>
</template>
