<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useProductsStore } from '@/stores/products'

const ui = useUiStore()
const router = useRouter()
const products = useProductsStore()
const query = ref('')
const input = ref(null)

const open = computed(() => ui.paletteOpen)

const suggestions = computed(() => {
  if (!query.value.trim()) {
    return [
      { label: 'Bestsellers', action: () => goCategory('burst') },
      { label: 'Metal Fight', action: () => goCategory('metal') },
      { label: 'Starters & Bundles', action: () => goCategory('starter') },
      { label: 'Parts & Tips', action: () => goCategory('parts') },
      { label: 'Account', action: () => router.push('/login') }
    ]
  }
  const q = query.value.toLowerCase()
  return products.items
    .filter(p => p.title.toLowerCase().includes(q) || p.series.toLowerCase().includes(q))
    .slice(0, 6)
})

function goCategory(id) {
  router.push({ name: 'shop-category', params: { category: id } })
  ui.closePalette()
}

function goProduct(p) {
  router.push({ name: 'product', params: { id: p.id } })
  ui.closePalette()
}

function clear() {
  query.value = ''
  nextTick(() => input.value?.focus())
}

watch(open, (val) => {
  if (val) {
    nextTick(() => input.value?.focus())
  } else {
    query.value = ''
  }
})
</script>

<template>
  <transition name="palette">
    <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-12">
      <div class="absolute inset-0 bg-storm/80 backdrop-blur-md" @click="ui.closePalette()" />
      <div class="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-storm-light/95 shadow-2xl shadow-rip-700/30">
        <div class="flex items-center gap-3 border-b border-white/10 px-4">
          <svg viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5 text-slate-400"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg>
          <input
            ref="input"
            v-model="query"
            type="text"
            placeholder="Search Beyblades, parts, series..."
            class="w-full bg-transparent py-4 text-sm text-white placeholder-slate-500 outline-none"
            @keydown.enter="suggestions[0]?.action?.()"
          />
          <kbd class="hidden rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400 sm:inline">Esc</kbd>
        </div>
        <div class="max-h-96 overflow-y-auto p-2">
          <p class="px-3 py-2 text-xs uppercase tracking-wider text-slate-500">
            {{ query ? 'Products' : 'Quick links' }}
          </p>
          <button
            v-for="(s, i) in suggestions"
            :key="i"
            class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-slate-200 hover:bg-white/5"
            @click="s.action ? s.action() : goProduct(s)"
          >
            <span class="flex items-center gap-3">
              <span class="flex h-7 w-7 items-center justify-center rounded-md bg-rip-500/20 text-xs text-rip-200">
                {{ s.icon || 'B' }}
              </span>
              {{ s.label || s.title }}
            </span>
            <span class="text-xs text-slate-500">↵</span>
          </button>
          <p v-if="query && !suggestions.length" class="px-3 py-6 text-center text-sm text-slate-500">
            No matches for "{{ query }}"
          </p>
        </div>
        <div class="flex items-center justify-between border-t border-white/10 px-4 py-2 text-xs text-slate-500">
          <span>Pro tip: press <kbd class="rounded border border-white/10 bg-white/5 px-1.5">Ctrl</kbd>+<kbd class="rounded border border-white/10 bg-white/5 px-1.5">K</kbd> anywhere</span>
          <span>Let It Rip ⌁ {{ new Date().getFullYear() }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.palette-enter-active,
.palette-leave-active { transition: opacity 0.25s ease; }
.palette-enter-from,
.palette-leave-to { opacity: 0; }
</style>
