<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Object, required: true },
  options: { type: Array, required: true }
})
const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const triggerEl = ref(null)
const popupStyle = ref({ top: '0px', left: '0px', width: '0px' })

const current = computed(() => props.modelValue)

function pick(p) {
  emit('update:modelValue', p)
  open.value = false
}

function measure() {
  if (!triggerEl.value) return
  const r = triggerEl.value.getBoundingClientRect()
  popupStyle.value = {
    top: (r.bottom + 8) + 'px',
    left: r.left + 'px',
    width: r.width + 'px'
  }
}

async function toggle() {
  if (!open.value) {
    await nextTick()
    measure()
  }
  open.value = !open.value
}

function onDocClick(e) {
  if (!open.value) return
  const trigger = triggerEl.value
  const popup = document.getElementById('bey-picker-popup')
  if (trigger?.contains(e.target)) return
  if (popup?.contains(e.target)) return
  open.value = false
}
function onKey(e) {
  if (e.key === 'Escape') open.value = false
}
function onScroll() {
  if (open.value) measure()
}
onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
  window.addEventListener('scroll', onScroll, true)
  window.addEventListener('resize', onScroll)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
  window.removeEventListener('scroll', onScroll, true)
  window.removeEventListener('resize', onScroll)
})
</script>

<template>
  <button
    ref="triggerEl"
    type="button"
    class="mt-4 flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-left text-sm text-white outline-none transition hover:border-white/20 focus:border-rip-400 focus:ring-2 focus:ring-rip-400/30"
    :class="open && 'border-rip-400/50 ring-2 ring-rip-400/30'"
    @click="toggle"
  >
    <span class="truncate">{{ current.title }} · <span class="text-accent-gold">{{ current.power }}</span> PWR</span>
    <FontAwesomeIcon
      icon="chevron-down"
      class="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform"
      :class="open && 'rotate-180'"
    />
  </button>

  <Teleport to="body">
    <transition name="picker">
      <div
        v-if="open"
        id="bey-picker-popup"
        class="fixed z-[100] max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-storm-light/95 py-1 shadow-2xl shadow-black/60 backdrop-blur-xl"
        :style="popupStyle"
      >
        <button
          v-for="p in options"
          :key="p.id"
          type="button"
          class="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm transition hover:bg-white/5"
          :class="p.id === current.id ? 'bg-rip-500/15 text-white' : 'text-slate-200'"
          @click="pick(p)"
        >
          <span class="truncate">{{ p.title }}</span>
          <span class="shrink-0 text-xs font-semibold text-accent-gold">{{ p.power }} PWR</span>
        </button>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.picker-enter-active,
.picker-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>