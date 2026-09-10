<script setup>
import { ref } from 'vue'

const props = defineProps({
  max: { type: Number, default: 5 },
  value: { type: Number, default: 0 },
  size: { type: Number, default: 16 },
  interactive: { type: Boolean, default: false }
})

const emit = defineEmits(['update:value'])

const hover = ref(0)

function pick(n) {
  if (!props.interactive) return
  emit('update:value', n)
}
</script>

<template>
  <div class="inline-flex items-center gap-0.5" @mouseleave="hover = 0">
    <button
      v-for="n in max"
      :key="n"
      type="button"
      :disabled="!interactive"
      class="text-yellow-400 transition-transform duration-150"
      :class="{
        'scale-110 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]': interactive && (hover >= n || value >= n),
        'hover:scale-125 cursor-pointer': interactive
      }"
      :style="{ width: size + 'px', height: size + 'px' }"
      @mouseenter="hover = interactive ? n : 0"
      @click="pick(n)"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" class="w-full h-full">
        <path v-if="(hover || value) >= n" d="M10 1l2.928 6.36L20 8.165l-5.2 4.7L16.165 20 10 16.36 3.835 20 5.2 12.865 0 8.165l7.072-.805z"/>
        <path v-else d="M10 1l2.928 6.36L20 8.165l-5.2 4.7L16.165 20 10 16.36 3.835 20 5.2 12.865 0 8.165l7.072-.805zM10 3.5l-2.05 4.45-4.95.57 3.7 3.34-.95 4.86L10 14.36l4.25 2.36-.95-4.86 3.7-3.34-4.95-.57z" fill-opacity="0.25"/>
      </svg>
    </button>
  </div>
</template>
