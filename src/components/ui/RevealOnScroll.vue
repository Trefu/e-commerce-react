<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  as: { type: String, default: 'div' },
  threshold: { type: Number, default: 0.15 },
  delay: { type: Number, default: 0 }
})

const root = ref(null)
let observer

onMounted(() => {
  if (!root.value) return
  if (!('IntersectionObserver' in window)) {
    root.value.classList.add('is-visible')
    return
  }
  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('is-visible'), props.delay)
        observer.unobserve(e.target)
      }
    })
  }, { threshold: props.threshold })
  observer.observe(root.value)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <component :is="as" ref="root" class="reveal">
    <slot />
  </component>
</template>
