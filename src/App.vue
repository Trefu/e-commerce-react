<script setup>
import { RouterView } from 'vue-router'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ToastStack from '@/components/ui/ToastStack.vue'
import CommandPalette from '@/components/ui/CommandPalette.vue'
import { useUiStore } from '@/stores/ui'
import { onMounted } from 'vue'

const ui = useUiStore()
onMounted(() => {
  ui.mountKeybinds()
})
</script>

<template>
  <div class="relative min-h-screen flex flex-col">
    <div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div class="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-rip-600/30 blur-3xl animate-float" />
      <div class="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-accent-blue/20 blur-3xl animate-float" style="animation-delay: -2s" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.08),_transparent_60%)]" />
    </div>

    <AppNavbar />

    <main class="flex-1">
      <RouterView v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </RouterView>
    </main>

    <AppFooter />

    <ToastStack />
    <CommandPalette />
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), filter 0.35s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(14px);
  filter: blur(4px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  filter: blur(2px);
}
</style>
