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
      <FontAwesomeIcon
        :icon="(hover || value) >= n ? ['fas', 'star'] : ['far', 'star']"
        class="w-full h-full"
      />
    </button>
  </div>
</template>
