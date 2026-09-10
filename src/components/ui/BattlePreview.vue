<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import TypeBadge from './TypeBadge.vue'

const props = defineProps({
  a: { type: Object, required: true },
  b: { type: Object, required: true },
  result: { type: Object, default: null }
})

const emit = defineEmits(['finish'])

const phase = ref('idle') // idle | countdown | launching | clashing | result
const countdown = ref(3)
const aSpin = ref(0)
const bSpin = ref(0)
const aOffset = ref({ x: 0, y: 0 })
const bOffset = ref({ x: 0, y: 0 })
const clashTick = ref(0)
const showResult = ref(false)
const aImgOk = ref(true)
const bImgOk = ref(true)

let raf
let timers = []

function safeImg(p) {
  if (!p) return ''
  if (Array.isArray(p.images) && p.images[0]) return p.images[0]
  if (p.image) return p.image
  return ''
}

function computeWinner() {
  const a = props.a
  const b = props.b
  if (!a || !b) return null
  const dirBonus = (() => {
    if (!a.spin || !b.spin) return 0
    if (a.spin === 'mixed' || b.spin === 'mixed') return 0
    if (a.spin === b.spin) return 0
    return ((a.rpm || 0) - (b.rpm || 0)) * 0.005
  })()
  const score = (p, dir) =>
    (p.stats?.attack || 0) * 0.5 +
    (p.stats?.burst || 0) * 0.3 +
    (p.stats?.stability || 0) * 0.2 +
    (p.power || 0) * 0.001 + dir
  const aScore = score(a, dirBonus)
  const bScore = score(b, -dirBonus)
  return {
    winner: aScore >= bScore ? a : b,
    aScore: Math.round(aScore),
    bScore: Math.round(bScore),
    margin: Math.round(Math.abs(aScore - bScore) * 2)
  }
}

const winner = computed(() => props.result || computeWinner())

function clearTimers() {
  for (const t of timers) clearTimeout(t)
  timers = []
}

function startBattle() {
  clearTimers()
  if (phase.value !== 'idle') return
  phase.value = 'countdown'
  countdown.value = 3
  let n = 3
  timers.push(setTimeout(() => {
    n = 2; countdown.value = 2
  }, 700))
  timers.push(setTimeout(() => {
    n = 1; countdown.value = 1
  }, 1400))
  timers.push(setTimeout(() => {
    countdown.value = 0
    launch()
  }, 2100))
}

function launch() {
  phase.value = 'launching'
  aOffset.value = { x: -120, y: 40 }
  bOffset.value = { x: 120, y: -40 }
  const dur = 700
  const start = performance.now()
  function step(now) {
    const t = Math.min((now - start) / dur, 1)
    const ease = 1 - Math.pow(1 - t, 3)
    aOffset.value = { x: -120 + 120 * ease, y: 40 - 40 * ease }
    bOffset.value = { x: 120 - 120 * ease, y: -40 + 40 * ease }
    if (t < 1) {
      raf = requestAnimationFrame(step)
    } else {
      clash()
    }
  }
  raf = requestAnimationFrame(step)
}

function clash() {
  phase.value = 'clashing'
  clashTick.value = 0
  // Flash 6 times at 120ms each
  for (let i = 1; i <= 6; i++) {
    timers.push(setTimeout(() => { clashTick.value = i }, i * 120))
  }
  // After flashing, reveal winner
  timers.push(setTimeout(() => reveal(), 7 * 120))
}

function reveal() {
  phase.value = 'result'
  showResult.value = true
  emit('finish', winner.value)
}

function rematch() {
  clearTimers()
  phase.value = 'idle'
  showResult.value = false
  aOffset.value = { x: 0, y: 0 }
  bOffset.value = { x: 0, y: 0 }
  clashTick.value = 0
  // Goes back to idle state — user must click "Launch Battle" again
}

function spinLoop() {
  aSpin.value = (aSpin.value + 18) % 360
  bSpin.value = (bSpin.value + 15) % 360
  raf = requestAnimationFrame(spinLoop)
}

onMounted(() => {
  raf = requestAnimationFrame(spinLoop)
})
onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  clearTimers()
})

// React to product changes (e.g., user picks new beys from select) — reset to idle, do NOT auto-start
watch(() => [props.a?.id, props.b?.id], () => {
  clearTimers()
  phase.value = 'idle'
  showResult.value = false
  aOffset.value = { x: 0, y: 0 }
  bOffset.value = { x: 0, y: 0 }
  clashTick.value = 0
  aImgOk.value = true
  bImgOk.value = true
  timers.push(setTimeout(() => startBattle(), 300))
})

// Color mapping for winner highlight
const winnerColorMap = {
  red: '#fb7185', blue: '#60a5fa', green: '#22c55e', purple: '#a78bfa',
  gold: '#fbbf24', black: '#cbd5e1', mixed: '#94a3b8'
}
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-storm-light via-storm to-storm-light">
    <!-- Stadium ring background -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-rip-500/20"></div>
      <div class="absolute left-1/2 top-1/2 h-[90%] w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 border-dashed border-rip-300/30"></div>
      <div class="absolute inset-0 opacity-20" style="background: radial-gradient(circle at 50% 50%, rgba(99,102,241,0.3), transparent 60%);"></div>
    </div>

    <div class="relative aspect-[16/9] sm:aspect-[21/9]">
      <!-- VS label -->
      <div class="absolute left-1/2 top-3 -translate-x-1/2 z-10">
        <span class="font-display text-2xl tracking-[0.4em] text-accent-gold/60">VS</span>
      </div>

      <!-- Bey A -->
      <div
        class="absolute left-1/2 top-1/2 z-10 transition-transform duration-100"
        :style="{ transform: `translate(calc(-50% + ${aOffset.x}px), calc(-50% + ${aOffset.y}px))` }"
      >
        <div class="relative h-20 w-20 sm:h-28 sm:w-28">
          <div class="streak absolute inset-0 animate-spin-fast" style="animation-duration: 0.25s;"></div>
          <img
            v-if="aImgOk && safeImg(a)"
            :src="safeImg(a)"
            :alt="a.title"
            class="absolute inset-0 m-auto h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
            :style="{ transform: `rotate(${aSpin}deg)` }"
            @error="aImgOk = false"
          />
          <div v-else class="absolute inset-0 m-auto flex h-full w-full items-center justify-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rip-500 to-rip-700 font-display text-2xl text-white shadow-glow">
              {{ (a?.title || '?')[0] }}
            </div>
          </div>
        </div>
        <div class="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
          <p class="text-[10px] font-bold uppercase tracking-widest text-white">{{ (a?.title || '').split(' ')[0] }}</p>
        </div>
      </div>

      <!-- Bey B -->
      <div
        class="absolute left-1/2 top-1/2 z-10 transition-transform duration-100"
        :style="{ transform: `translate(calc(-50% + ${bOffset.x}px), calc(-50% + ${bOffset.y}px))` }"
      >
        <div class="relative h-20 w-20 sm:h-28 sm:w-28">
          <div class="streak absolute inset-0 animate-spin-fast" style="animation-duration: 0.28s; animation-direction: reverse;"></div>
          <img
            v-if="bImgOk && safeImg(b)"
            :src="safeImg(b)"
            :alt="b.title"
            class="absolute inset-0 m-auto h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
            :style="{ transform: `rotate(${bSpin}deg)` }"
            @error="bImgOk = false"
          />
          <div v-else class="absolute inset-0 m-auto flex h-full w-full items-center justify-center">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rip-500 to-rip-700 font-display text-2xl text-white shadow-glow">
              {{ (b?.title || '?')[0] }}
            </div>
          </div>
        </div>
        <div class="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
          <p class="text-[10px] font-bold uppercase tracking-widest text-white">{{ (b?.title || '').split(' ')[0] }}</p>
        </div>
      </div>

      <!-- Clash flash — uses :key to retrigger CSS animation -->
      <div
        v-if="clashTick > 0"
        :key="clashTick"
        class="absolute inset-0 z-20 bg-white pointer-events-none"
        style="animation: clash-flash 0.15s ease-out; mix-blend-mode: screen;"
      ></div>

      <!-- Countdown overlay (always shown during countdown phase) -->
      <div
        v-if="phase === 'countdown'"
        class="absolute inset-0 z-30 flex items-center justify-center bg-storm/60 backdrop-blur-sm"
      >
        <div :key="countdown" class="font-display text-9xl text-white drop-shadow-[0_0_30px_rgba(251,191,36,0.9)] animate-pop-in">
          {{ countdown }}
        </div>
      </div>

      <!-- Idle overlay — shown before user launches and after rematch finishes -->
      <div
        v-if="phase === 'idle' && !showResult"
        class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-storm/40 backdrop-blur-[2px] gap-3"
      >
        <p class="text-xs uppercase tracking-[0.4em] text-accent-gold/80">Ready to launch</p>
        <button
          class="btn-primary !py-3 !px-6 text-base shadow-glow"
          @click="startBattle"
        >
          ⚡ Launch Battle
        </button>
        <p class="text-[10px] uppercase tracking-widest text-slate-500">Pick different beys above to change matchup</p>
      </div>

      <!-- Result overlay -->
      <transition name="rise">
        <div
          v-if="showResult && winner"
          class="absolute inset-0 z-30 flex flex-col items-center justify-center bg-storm/90 backdrop-blur-md"
        >
          <p class="text-xs uppercase tracking-[0.4em] text-slate-400">Winner</p>
          <h3
            class="mt-1 max-w-[80%] truncate px-2 text-center font-display text-3xl text-white sm:text-4xl"
            :style="{ color: winnerColorMap[winner.winner.color] || '#fbbf24', textShadow: `0 0 24px ${winnerColorMap[winner.winner.color] || '#fbbf24'}88` }"
          >
            {{ winner.winner.title }}
          </h3>
          <div class="mt-3 flex items-center gap-3">
            <TypeBadge :type="winner.winner.type" />
            <span class="text-sm text-slate-300">+{{ winner.margin }} power margin</span>
          </div>
          <button class="btn-primary mt-5 !py-2 !px-5 text-sm" @click="rematch">⚡ Battle again</button>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.rise-enter-active { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); }
.rise-leave-active { transition: all 0.3s ease; }
.rise-enter-from { opacity: 0; transform: translateY(20px) scale(0.95); }
.rise-leave-to { opacity: 0; transform: scale(1.05); }

@keyframes clash-flash {
  0% { opacity: 0; }
  20% { opacity: 1; }
  100% { opacity: 0; }
}
</style>
