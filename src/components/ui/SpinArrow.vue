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
    <FontAwesomeIcon
      v-if="direction === 'right'"
      icon="arrow-rotate-right"
      :style="{ width: size + 'px', height: size + 'px' }"
      :class="['text-rip-300', spinning ? 'animate-spin-slow' : '']"
      aria-label="Right (clockwise) spin"
    />
    <FontAwesomeIcon
      v-else-if="direction === 'left'"
      icon="arrow-rotate-left"
      :style="{ width: size + 'px', height: size + 'px' }"
      :class="['text-rip-300', spinning ? 'animate-spin-slow' : '']"
      aria-label="Left (counter-clockwise) spin"
    />
    <FontAwesomeIcon
      v-else
      icon="arrows-rotate"
      :style="{ width: size + 'px', height: size + 'px' }"
      :class="['text-rip-300', spinning ? 'animate-spin-slow' : '']"
      aria-label="Dual spin"
    />

    <span v-if="label" class="text-[10px] uppercase tracking-widest text-slate-400">
      {{ direction === 'mixed' ? 'Dual spin' : direction + ' spin' }}
    </span>
  </span>
</template>
