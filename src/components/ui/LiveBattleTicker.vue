<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const bladers = [
  'Kairos', 'Lyra', 'Tomás', 'Sora', 'Mauro', 'Aiko', 'Mateo', 'Zara',
  'Daichi', 'Vega', 'Hugo', 'Ren', 'Iván', 'Niko', 'Pilar', 'Seba',
  'Alex', 'Toby', 'Luna', 'Kira'
]
const beys = [
  'Ultimate Valkyrie', 'Cho-Z Spriggan', 'Dynamite Belial', 'L Drago Destroy',
  'Guilty Longinus', 'Storm Pegasus', 'Earth Eagle', 'Cosmic Pegasus',
  'Achilles A0', 'Dragoon MSUV', 'Draciel S'
]
const arenas = ['Tokyo Dome', 'BA Arena', 'Madrid Open', 'NYCC', 'Bey Station', 'Storm Stadium']
const results = ['BURST FINISH', 'SPIN-OUT', 'EXTREME FINISH', 'STAMINA WIN', 'OVER-FINISH']

const items = ref([])
let nextId = 1
let timer

function fakeBattle() {
  const a = beys[Math.floor(Math.random() * beys.length)]
  let b = a
  while (b === a) b = beys[Math.floor(Math.random() * beys.length)]
  const winner = Math.random() < 0.5 ? a : b
  const loser = winner === a ? b : a
  const bladerA = bladers[Math.floor(Math.random() * bladers.length)]
  const bladerB = bladers.filter(x => x !== bladerA)[Math.floor(Math.random() * (bladers.length - 1))]
  const arena = arenas[Math.floor(Math.random() * arenas.length)]
  const result = results[Math.floor(Math.random() * results.length)]
  const power = 7000 + Math.round(Math.random() * 3000)
  return {
    id: nextId++,
    a,
    b,
    winner,
    loser,
    bladerA,
    bladerB,
    arena,
    result,
    power,
    time: 'just now'
  }
}

onMounted(() => {
  for (let i = 0; i < 6; i++) items.value.push(fakeBattle())
  timer = setInterval(() => {
    const b = fakeBattle()
    items.value.unshift(b)
    if (items.value.length > 10) items.value.pop()
  }, 3500)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-storm/40 backdrop-blur">
    <header class="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
      <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-accent-red">
        <span class="relative flex h-1.5 w-1.5">
          <span class="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent-red"></span>
          <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-red"></span>
        </span>
        Live arena ticker
      </div>
      <span class="text-[10px] uppercase tracking-widest text-slate-500">{{ items.length }} recent</span>
    </header>
    <ul class="max-h-72 divide-y divide-white/5 overflow-y-auto">
      <transition-group name="slide-down">
        <li
          v-for="b in items" :key="b.id"
          class="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02]"
        >
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold"
            :style="{
              background: 'linear-gradient(135deg, ' + (b.winner === b.a ? '#fbbf24, #f59e0b' : 'rgba(255,255,255,0.04), rgba(255,255,255,0.04)') + ')',
              color: b.winner === b.a ? '#0b1020' : '#94a3b8'
            }"
          >{{ b.winner === b.a ? 'W' : 'L' }}</span>
          <div class="flex-1 min-w-0 text-xs">
            <p class="truncate">
              <span class="text-white font-semibold">{{ b.winner }}</span>
              <span class="text-slate-500">bursts</span>
              <span class="text-slate-300">{{ b.loser }}</span>
            </p>
            <p class="text-[10px] text-slate-500">{{ b.bladerA }} vs {{ b.bladerB }} · {{ b.arena }} · {{ b.result }}</p>
          </div>
          <div class="text-right">
            <p class="font-display text-xs text-accent-gold tabular-nums">{{ b.power }}</p>
            <p class="text-[9px] uppercase tracking-widest text-slate-600">PWR</p>
          </div>
        </li>
      </transition-group>
    </ul>
  </div>
</template>

<style scoped>
.slide-down-enter-active { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); }
.slide-down-leave-active { transition: all 0.3s ease; position: absolute; }
.slide-down-enter-from { opacity: 0; transform: translateY(-10px); }
.slide-down-leave-to { opacity: 0; transform: translateX(20px); }
</style>
