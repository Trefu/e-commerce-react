<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import BeybladeSpinner from '@/components/ui/BeybladeSpinner.vue'

const angle = ref(0)
onMounted(() => {
  let raf
  const loop = () => { angle.value = (angle.value + 0.8) % 360; raf = requestAnimationFrame(loop) }
  raf = requestAnimationFrame(loop)
})
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
    <div class="relative h-40 w-40">
      <div class="streak absolute inset-0 rounded-full animate-spin-fast"></div>
      <div class="absolute inset-2 rounded-full bg-gradient-to-br from-rip-300 to-rip-700"></div>
      <div class="absolute inset-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold"></div>
    </div>
    <p class="mt-8 font-display text-7xl text-white">404</p>
    <h1 class="mt-2 font-display text-3xl text-white">Lost in the stadium.</h1>
    <p class="mt-3 max-w-md text-slate-400">That page didn't make it to the ring. Try heading back to the arena.</p>
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <RouterLink to="/" class="btn-primary">Back to home</RouterLink>
      <RouterLink to="/shop" class="btn-secondary">Browse shop</RouterLink>
    </div>
  </div>
</template>
