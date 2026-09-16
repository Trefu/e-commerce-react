<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Object, required: true },
  compact: { type: Boolean, default: false }
})

const labels = [
  { key: 'attack',    label: 'Attack',   color: '#ef4444' },
  { key: 'defense',   label: 'Defense',  color: '#3b82f6' },
  { key: 'stamina',   label: 'Stamina',  color: '#22c55e' },
  { key: 'burst',     label: 'Burst',    color: '#fbbf24' },
  { key: 'stability', label: 'Stability', color: '#a78bfa' }
]

const rows = computed(() =>
  labels.map(l => ({ ...l, value: props.stats?.[l.key] ?? 0 }))
)
</script>

<template>
  <div :class="['w-full space-y-2', compact && 'space-y-1.5']">
    <div
      v-for="(r, i) in rows"
      :key="r.key"
      class="flex items-center gap-3"
    >
      <span
        class="w-16 shrink-0 text-[10px] font-bold uppercase tracking-[0.15em]"
        :class="compact ? 'text-slate-400' : 'text-slate-300'"
      >{{ r.label }}</span>
      <div class="relative h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
        <div
          class="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          :style="{
            width: r.value + '%',
            background: `linear-gradient(90deg, ${r.color}88, ${r.color})`,
            boxShadow: `0 0 12px ${r.color}66`
          }"
        ></div>
        <!-- tick marks -->
        <div class="absolute inset-0 flex justify-between px-0">
          <span v-for="n in 4" :key="n" class="h-full w-px bg-white/10"></span>
        </div>
      </div>
      <span
        class="w-9 shrink-0 text-right font-display text-sm tabular-nums"
        :style="{ color: r.color }"
      >{{ r.value }}</span>
    </div>
  </div>
</template>
