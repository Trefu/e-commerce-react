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
      <RouterLink to="/" class="flex items-center">
        <img
          src="/logo.png"
          alt="Let It Rip"
          class="shrink-0 w-auto transition-all duration-300"
          :class="scrolled ? 'h-20 sm:h-24' : 'h-14 sm:h-16'"
        />
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
        <RouterLink to="/shop/starter" class="btn-ghost" active-class="text-white">Starters</RouterLink>
      </nav>

      <button
        class="btn-secondary hidden md:inline-flex flex-1 max-w-md !justify-start !py-2 !px-4 text-slate-400"
        @click="ui.openPalette()"
      >
        <FontAwesomeIcon icon="magnifying-glass" class="h-4 w-4 text-slate-400" />
        <span class="text-sm">Search Beyblades...</span>
        <span class="ml-auto flex gap-1">
          <kbd class="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">Ctrl</kbd>
          <kbd class="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">K</kbd>
        </span>
      </button>

      <div class="ml-auto flex items-center gap-1">
        <RouterLink to="/wishlist" class="relative hidden sm:inline-flex btn-ghost !px-3" aria-label="Wishlist">
          <FontAwesomeIcon :icon="['far', 'heart']" class="h-5 w-5" />
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

        <RouterLink to="/cart" class="relative btn-ghost !px-3" aria-label="Cart">
          <span class="relative inline-flex">
            <FontAwesomeIcon icon="cart-shopping" class="h-5 w-5" :class="cart.count && 'animate-tilt-shake'" />
            <span v-if="cart.count" class="absolute -right-2 -top-2 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-gradient-to-br from-accent-red to-rose-400 px-1 text-[10px] font-bold text-white shadow-[0_0_0_2px_rgba(11,16,32,1)] animate-pop-in">
              {{ cart.count }}
            </span>
          </span>
        </RouterLink>

        <button class="btn-ghost md:hidden !px-2" @click="menuOpen = !menuOpen" aria-label="Menu">
          <FontAwesomeIcon v-if="!menuOpen" icon="bars" class="h-5 w-5" />
          <FontAwesomeIcon v-else icon="xmark" class="h-5 w-5" />
        </button>

        <RouterLink v-if="!auth.user" to="/login" class="btn-secondary !py-1.5 !px-4">Sign in</RouterLink>
      </div>
    </div>

    <transition name="dropdown">
      <nav v-if="menuOpen" class="border-t border-white/5 bg-storm/95 backdrop-blur-xl md:hidden">
        <div class="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
          <RouterLink to="/" class="btn-ghost !justify-start" @click="menuOpen = false">Home</RouterLink>
          <RouterLink to="/shop" class="btn-ghost !justify-start" @click="menuOpen = false">Shop</RouterLink>
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
