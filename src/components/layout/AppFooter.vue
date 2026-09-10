<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const facts = [
  'Beyblade was invented in 1999 by Takara — the spinning top game that started a global craze.',
  'The L Drago special-move requires an activation slot, the only spin gear with that feature.',
  'A Beyblade stadium is a perfectly circular bowl — the bevel is what keeps bladers in play.',
  'Stamina types win by outlasting opponents; Defense types absorb hits and counter-attack.',
  'The 4D system (Metal Fight) lets bladers swap bottom tips mid-battle for the first time.',
  'World championships have been held since 2003 across multiple generations of Beyblade.'
]

const idx = ref(0)
let timer
onMounted(() => {
  timer = setInterval(() => { idx.value = (idx.value + 1) % facts.length }, 4500)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <footer class="mt-24 border-t border-white/10 bg-storm-light/40">
    <div class="overflow-hidden border-b border-white/5 py-2 text-xs uppercase tracking-[0.3em] text-rip-300">
      <div class="marquee gap-12 whitespace-nowrap">
        <span v-for="n in 2" :key="n" class="flex gap-12">
          <span v-for="(f, i) in facts" :key="n + '-' + i">· {{ f }}</span>
        </span>
      </div>
    </div>

    <div class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
      <div>
        <div class="flex items-center gap-3">
          <div class="relative h-10 w-10">
            <div class="absolute inset-0 rounded-full bg-gradient-to-br from-rip-300 to-rip-700 shadow-glow"></div>
            <div class="absolute inset-1 rounded-full bg-storm flex items-center justify-center font-display text-rip-200">L</div>
            <div class="streak absolute inset-0 rounded-full"></div>
          </div>
          <span class="font-display text-2xl tracking-widest text-white">LET&nbsp;IT&nbsp;RIP</span>
        </div>
        <p class="mt-4 text-sm text-slate-400 leading-relaxed">
          Premium Beyblades, metal wheels and starter bundles. Ships worldwide from the storm.
        </p>
      </div>

      <div>
        <h4 class="font-display text-lg tracking-widest text-white">Shop</h4>
        <ul class="mt-4 space-y-2 text-sm text-slate-400">
          <li><RouterLink to="/shop/burst" class="hover:text-white">Burst Series</RouterLink></li>
          <li><RouterLink to="/shop/metal" class="hover:text-white">Metal Fight</RouterLink></li>
          <li><RouterLink to="/shop/starter" class="hover:text-white">Starter Packs</RouterLink></li>
          <li><RouterLink to="/shop/parts" class="hover:text-white">Parts & Tools</RouterLink></li>
        </ul>
      </div>

      <div>
        <h4 class="font-display text-lg tracking-widest text-white">Account</h4>
        <ul class="mt-4 space-y-2 text-sm text-slate-400">
          <li><RouterLink to="/login" class="hover:text-white">Sign in</RouterLink></li>
          <li><RouterLink to="/signup" class="hover:text-white">Create account</RouterLink></li>
          <li><RouterLink to="/orders" class="hover:text-white">My orders</RouterLink></li>
          <li><RouterLink to="/wishlist" class="hover:text-white">Wishlist</RouterLink></li>
        </ul>
      </div>

      <div>
        <h4 class="font-display text-lg tracking-widest text-white">Newsletter</h4>
        <p class="mt-4 text-sm text-slate-400">Get launch alerts, restocks and 10% off your first order.</p>
        <form class="mt-4 flex gap-2" @submit.prevent>
          <input class="input" type="email" placeholder="you@stadium.io" required />
          <button class="btn-primary" type="submit">Join</button>
        </form>
      </div>
    </div>

    <div class="border-t border-white/5">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6 lg:px-8">
        <p>© {{ new Date().getFullYear() }} Let It Rip · All Beyblade product imagery © respective owners.</p>
        <p>Built with Vue 3 · Vite · Pinia · ♥ in Buenos Aires</p>
      </div>
    </div>
  </footer>
</template>
