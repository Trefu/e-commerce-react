<script setup>
import { useUiStore } from '@/stores/ui'
import { computed } from 'vue'

const ui = useUiStore()

const colorMap = {
  indigo: { bar: 'from-rip-500 to-rip-300', icon: 'text-rip-300' },
  green:  { bar: 'from-accent-green to-emerald-300', icon: 'text-accent-green' },
  red:    { bar: 'from-accent-red to-rose-300', icon: 'text-accent-red' },
  gold:   { bar: 'from-accent-gold to-yellow-200', icon: 'text-accent-gold' }
}

function colorClasses(c) {
  return colorMap[c] || colorMap.indigo
}

const toasts = computed(() => ui.toasts)
</script>

<template>
  <div class="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-3 w-80 max-w-[calc(100vw-2rem)]">
    <transition-group name="toast">
      <div
        v-for="t in toasts"
        :key="t.id"
        class="pointer-events-auto relative overflow-hidden rounded-2xl border border-white/10 bg-storm-light/95 backdrop-blur-xl shadow-card"
      >
        <div class="absolute left-0 top-0 h-full w-1 bg-gradient-to-b" :class="colorClasses(t.color).bar"></div>
        <div class="flex gap-3 p-4 pl-5">
          <div :class="['mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/5', colorClasses(t.color).icon]">
            <span v-if="t.icon" class="text-sm font-bold">{{ t.icon }}</span>
            <svg v-else viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M10 1l2.928 6.36L20 8.165l-5.2 4.7L16.165 20 10 16.36 3.835 20 5.2 12.865 0 8.165l7.072-.805z"/></svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white">{{ t.title }}</p>
            <p v-if="t.content" class="mt-0.5 text-xs text-slate-300">{{ t.content }}</p>
          </div>
          <button
            class="text-slate-400 hover:text-white"
            @click="ui.dismiss(t.id)"
            aria-label="Dismiss notification"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M6.225 4.811L4.811 6.225 8.586 10l-3.775 3.775 1.414 1.414L10 11.414l3.775 3.775 1.414-1.414L11.414 10l3.775-3.775-1.414-1.414L10 8.586z"/></svg>
          </button>
        </div>
        <div class="absolute bottom-0 left-0 h-0.5 w-full bg-white/5">
          <div class="h-full bg-gradient-to-r animate-[shimmer_2s_linear_infinite]" :class="colorClasses(t.color).bar"></div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}
.toast-move {
  transition: transform 0.4s ease;
}
</style>
