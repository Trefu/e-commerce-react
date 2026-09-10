<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useWishlistStore } from '@/stores/wishlist'

const cart = useCartStore()
const auth = useAuthStore()
const ui = useUiStore()
const wishlist = useWishlistStore()
const router = useRouter()

const menuOpen = ref(false)
const userOpen = ref(false)
const scrolled = ref(false)

// Simulated live battle counter — drifts between 12 and 48 to feel alive
const liveBattles = ref(24)
let liveTimer
onMounted(() => {
  liveTimer = setInterval(() => {
    const delta = Math.round((Math.random() - 0.5) * 4)
    liveBattles.value = Math.max(8, Math.min(64, liveBattles.value + delta))
  }, 4000)
})
onUnmounted(() => clearInterval(liveTimer))

const avatarInitial = computed(() => auth.user?.name?.[0]?.toUpperCase() || '?')

function onScroll() {
  scrolled.value = window.scrollY > 8
}
window.addEventListener('scroll', onScroll, { passive: true })
onScroll()

function logout() {
  auth.logout()
  ui.toast({ title: 'Signed out', content: 'See you in the stadium!', color: 'indigo' })
  userOpen.value = false
  router.push('/')
}
</script>

<template>
  <header
    class="sticky top-0 z-40 transition-all duration-300"
    :class="scrolled ? 'backdrop-blur-xl bg-storm/70 border-b border-white/10 shadow-card' : 'bg-transparent'"
  >
    <div class="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
      <RouterLink to="/" class="flex items-center gap-2.5">
        <div class="relative h-10 w-10">
          <div class="absolute inset-0 rounded-full bg-gradient-to-br from-rip-300 to-rip-700 shadow-glow"></div>
          <div class="streak absolute inset-0 rounded-full"></div>
          <div class="absolute inset-1 rounded-full bg-storm flex items-center justify-center">
            <img src="/beyblades/real/lord-spriggan.jpg" alt="" class="h-7 w-7 rounded-full object-cover" />
          </div>
          <!-- pulse ring -->
          <span class="absolute -inset-0.5 rounded-full border border-accent-gold/60 animate-pulse-ring pointer-events-none"></span>
        </div>
        <div class="hidden sm:flex flex-col leading-none">
          <span class="font-display text-xl tracking-widest text-white">LET IT RIP</span>
          <span class="text-[8px] uppercase tracking-[0.4em] text-accent-gold/80 mt-0.5">Bladers · Since 1999</span>
        </div>
      </RouterLink>

      <!-- Live battle counter -->
      <div class="hidden lg:flex items-center gap-2 ml-2 rounded-full border border-accent-red/30 bg-accent-red/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-red">
        <span class="relative flex h-1.5 w-1.5">
          <span class="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent-red"></span>
          <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-red"></span>
        </span>
        Live · {{ liveBattles }} battles
      </div>

      <nav class="hidden md:flex items-center gap-1 ml-4">
        <RouterLink to="/" class="btn-ghost" exact-active-class="text-white">Home</RouterLink>
        <RouterLink to="/shop" class="btn-ghost" active-class="text-white">Shop</RouterLink>
        <RouterLink to="/shop/burst" class="btn-ghost" active-class="text-white">Burst</RouterLink>
        <RouterLink to="/shop/metal" class="btn-ghost" active-class="text-white">Metal</RouterLink>
        <RouterLink to="/shop/starter" class="btn-ghost" active-class="text-white">Starters</RouterLink>
      </nav>

      <button
        class="btn-secondary hidden md:inline-flex flex-1 max-w-md !justify-start !py-2 !px-4 text-slate-400"
        @click="ui.openPalette()"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/></svg>
        <span class="text-sm">Search Beyblades...</span>
        <span class="ml-auto flex gap-1">
          <kbd class="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">Ctrl</kbd>
          <kbd class="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">K</kbd>
        </span>
      </button>

      <div class="ml-auto flex items-center gap-1">
        <RouterLink to="/wishlist" class="relative hidden sm:inline-flex btn-ghost !px-3" aria-label="Wishlist">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          <span v-if="wishlist.count" class="absolute -right-1 -top-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-accent-red px-1 text-[10px] font-bold text-white animate-pop-in">
            {{ wishlist.count }}
          </span>
        </RouterLink>

        <div class="relative" v-if="auth.user">
          <button class="btn-ghost flex items-center gap-2 !px-3" @click="userOpen = !userOpen">
            <span class="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rip-500 to-rip-700 font-semibold text-white">{{ avatarInitial }}</span>
            <span class="hidden text-sm text-white sm:inline">{{ auth.user.name.split(' ')[0] }}</span>
          </button>
          <transition name="dropdown">
            <div v-if="userOpen" class="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-storm-light shadow-card">
              <div class="border-b border-white/5 px-4 py-3">
                <p class="text-sm font-semibold text-white">{{ auth.user.name }}</p>
                <p class="truncate text-xs text-slate-400">{{ auth.user.email }}</p>
              </div>
              <RouterLink to="/orders" class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5" @click="userOpen = false">My orders</RouterLink>
              <RouterLink to="/wishlist" class="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5" @click="userOpen = false">Wishlist</RouterLink>
              <button class="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-accent-red hover:bg-white/5" @click="logout">Sign out</button>
            </div>
          </transition>
        </div>
        <RouterLink v-else to="/login" class="btn-secondary !py-1.5 !px-4">Sign in</RouterLink>

        <RouterLink to="/cart" class="relative btn-ghost !px-3" aria-label="Cart">
          <span class="relative inline-flex">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5" :class="cart.count && 'animate-tilt-shake'"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
            <span v-if="cart.count" class="absolute -right-2 -top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gradient-to-br from-accent-red to-rose-400 px-1 text-[11px] font-bold text-white shadow-[0_0_0_3px_rgba(11,16,32,1)] animate-pop-in">
              {{ cart.count }}
            </span>
          </span>
        </RouterLink>

        <button class="btn-ghost md:hidden !px-2" @click="menuOpen = !menuOpen" aria-label="Menu">
          <svg v-if="!menuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
    </div>

    <transition name="dropdown">
      <nav v-if="menuOpen" class="border-t border-white/5 bg-storm/95 backdrop-blur-xl md:hidden">
        <div class="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
          <RouterLink to="/" class="btn-ghost !justify-start" @click="menuOpen = false">Home</RouterLink>
          <RouterLink to="/shop" class="btn-ghost !justify-start" @click="menuOpen = false">Shop</RouterLink>
          <RouterLink to="/shop/burst" class="btn-ghost !justify-start" @click="menuOpen = false">Burst</RouterLink>
          <RouterLink to="/shop/metal" class="btn-ghost !justify-start" @click="menuOpen = false">Metal</RouterLink>
          <RouterLink to="/shop/starter" class="btn-ghost !justify-start" @click="menuOpen = false">Starters</RouterLink>
          <button class="btn-secondary mt-2 !justify-start" @click="ui.openPalette(); menuOpen = false">Search...</button>
        </div>
      </nav>
    </transition>
  </header>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.dropdown-enter-from,
.dropdown-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
