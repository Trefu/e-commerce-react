<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import TypeBadge from './TypeBadge.vue'

const props = defineProps({
  a: { type: Object, required: true },
  b: { type: Object, required: true },
  result: { type: Object, default: null }
})

const emit = defineEmits(['finish'])

// Physics constants (in px / frame, 60fps target)
const STADIUM_R = 135     // inner usable radius — bigger arena for more chaos
const BEY_R = 24         // collision radius of a bey
const FRICTION = 0.992   // per-frame velocity damping
const SPIN_DECAY = 0.9985 // per-frame spin damping
const STOP_SPIN = 0.35   // below this → stopped
const COLLISION_BOOST = 6.5
const COLLISION_CHAOS = 0.35  // random impulse on hit (0-1)
const WALL_BOOST = 0.6  // speed gain when slamming the wall
const MIN_SPEED = 0.6    // never fully stop while alive

const phase = ref('idle') // idle | countdown | launching | clashing | result
const countdown = ref(3)

// Visual transforms for each bey
const aPos = ref({ x: 0, y: 0 })      // px offset from center
const bPos = ref({ x: 0, y: 0 })
const aRot = ref(0)                   // current rotation angle (deg)
const bRot = ref(0)
const aScale = ref(1)                 // 1 normal, <1 when wobbling/stopped
const bScale = ref(1)
const aOpacity = ref(1)
const bOpacity = ref(1)

const clashTick = ref(0)   // increments each collision
const collisionCount = ref(0)
const showResult = ref(false)
const aImgOk = ref(true)
const bImgOk = ref(true)

// Spark particles — short-lived burst at collision point
const sparks = ref([])
let sparkId = 0

// Internal physics state (non-reactive for perf)
const phys = {
  ax: 0, ay: 0,
  bx: 0, by: 0,
  aSpin: 0,
  bSpin: 0,
  aFrames: 0,
  bFrames: 0,
  aStopped: false,
  bStopped: false,
  aFrameStart: 0,
  bFrameStart: 0
}

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
  timers.push(setTimeout(() => { countdown.value = 2 }, 700))
  timers.push(setTimeout(() => { countdown.value = 1 }, 1400))
  timers.push(setTimeout(() => { countdown.value = 0; launch() }, 2100))
}

function launch() {
  phase.value = 'launching'
  // First shot: head-on collision. Beys start at opposite edges on the same axis
  aPos.value = { x: -125, y: 0 }
  bPos.value = { x: 125, y: 0 }
  phys.ax = 11; phys.ay = 0
  phys.bx = -11; phys.by = 0
  phys.aSpin = 18 + (props.a?.stats?.attack || 50) * 0.06
  phys.bSpin = 18 + (props.b?.stats?.attack || 50) * 0.06
  phys.aFrameStart = phys.aSpin
  phys.bFrameStart = phys.bSpin
  phys.aFrames = 0
  phys.bFrames = 0
  phys.aStopped = false
  phys.bStopped = false
  aScale.value = 1
  bScale.value = 1
  aOpacity.value = 1
  bOpacity.value = 1
  collisionCount.value = 0
  sparks.value = []

  const start = performance.now()
  const dur = 600
  function step(now) {
    const t = Math.min((now - start) / dur, 1)
    if (t < 1) {
      const e = 1 - Math.pow(1 - t, 3)
      aPos.value = { x: -115 + 115 * e, y: 0 }
      bPos.value = { x: 115 - 115 * e, y: 0 }
      raf = requestAnimationFrame(step)
    } else {
      phase.value = 'clashing'
      physLoop()
    }
  }
  raf = requestAnimationFrame(step)
}

function physLoop() {
  // 1. Integrate position
  aPos.value.x += phys.ax
  aPos.value.y += phys.ay
  bPos.value.x += phys.bx
  bPos.value.y += phys.by

  // 2. Friction
  phys.ax *= FRICTION
  phys.ay *= FRICTION
  phys.bx *= FRICTION
  phys.by *= FRICTION

  // 3. Rotate
  const aDir = (props.a?.spin === 'left') ? -1 : 1
  const bDir = (props.b?.spin === 'left') ? -1 : 1
  aRot.value = (aRot.value + phys.aSpin * aDir) % 360
  bRot.value = (bRot.value + phys.bSpin * bDir) % 360

  // 4. Decay spin
  phys.aSpin *= SPIN_DECAY
  phys.bSpin *= SPIN_DECAY
  phys.aFrames++
  phys.bFrames++

  // 4b. Update sparks
  if (sparks.value.length) {
    const survivors = []
    for (const s of sparks.value) {
      s.x += s.vx
      s.y += s.vy
      s.vx *= 0.92
      s.vy *= 0.92
      s.life -= 0.04
      if (s.life > 0) survivors.push(s)
    }
    sparks.value = survivors
  }

  // 5. Bey-vs-bey collision (RANDOM direction per bey, no bias toward opponent)
  const dx = bPos.value.x - aPos.value.x
  const dy = bPos.value.y - aPos.value.y
  const dist = Math.hypot(dx, dy)
  if (dist < BEY_R * 2 && dist > 0.001) {
    const nx = dx / dist
    const ny = dy / dist
    // Separate so they don't overlap
    const overlap = (BEY_R * 2 - dist) / 2 + 1
    aPos.value.x -= nx * overlap
    aPos.value.y -= ny * overlap
    bPos.value.x += nx * overlap
    bPos.value.y += ny * overlap

    // Each bey picks a random direction (biased away from center, not from opponent)
    const aCx = aPos.value.x, aCy = aPos.value.y
    const bCx = bPos.value.x, bCy = bPos.value.y
    const aAwayAngle = Math.atan2(aCy, aCx)
    const bAwayAngle = Math.atan2(bCy, bCx)
    const aAngle = aAwayAngle + (Math.random() - 0.5) * Math.PI * 1.4
    const bAngle = bAwayAngle + (Math.random() - 0.5) * Math.PI * 1.4

    const aIncomingSpeed = Math.hypot(phys.ax, phys.ay)
    const bIncomingSpeed = Math.hypot(phys.bx, phys.by)
    const aSpeed = Math.max(MIN_SPEED, aIncomingSpeed * 0.8 + 2.5 + Math.random() * 3.5)
    const bSpeed = Math.max(MIN_SPEED, bIncomingSpeed * 0.8 + 2.5 + Math.random() * 3.5)
    phys.ax = Math.cos(aAngle) * aSpeed
    phys.ay = Math.sin(aAngle) * aSpeed
    phys.bx = Math.cos(bAngle) * bSpeed
    phys.by = Math.sin(bAngle) * bSpeed

    // Boost spin from impact
    phys.aSpin = Math.min(phys.aFrameStart + 6, phys.aSpin + COLLISION_BOOST)
    phys.bSpin = Math.min(phys.bFrameStart + 6, phys.bSpin + COLLISION_BOOST)

    // Spawn sparks at collision point
    const sparkColors = ['#fbbf24', '#f97316', '#ef4444', '#ffffff', '#a78bfa']
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 1.5 + Math.random() * 4
      sparks.value.push({
        id: sparkId++,
        x: aCx + (Math.random() - 0.5) * 8,
        y: aCy + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        size: 2 + Math.random() * 4
      })
    }

    clashTick.value++
    collisionCount.value++
  }

  // 6. Collide with stadium wall (visible yellow ring)
  bounceWall('a')
  bounceWall('b')

  // 7. Stop condition
  if (!phys.aStopped && phys.aSpin < STOP_SPIN) phys.aStopped = true
  if (!phys.bStopped && phys.bSpin < STOP_SPIN) phys.bStopped = true

  // 8. Visual feedback for stopping
  if (phys.aStopped && aScale.value > 0.5) {
    aScale.value = Math.max(0.5, aScale.value - 0.04)
    aOpacity.value = Math.max(0.3, aOpacity.value - 0.03)
  }
  if (phys.bStopped && bScale.value > 0.5) {
    bScale.value = Math.max(0.5, bScale.value - 0.04)
    bOpacity.value = Math.max(0.3, bOpacity.value - 0.03)
  }

  // 9. End condition
  const oneStopped = phys.aStopped || phys.bStopped
  const bothStopped = phys.aStopped && phys.bStopped
  const minFrames = 60
  if ((oneStopped && phys.aFrames > minFrames) || bothStopped) {
    finishBattle()
    return
  }
  if (phys.aFrames > 360) {
    finishBattle()
    return
  }

  raf = requestAnimationFrame(physLoop)
}

function bounceWall(key) {
  const pos = key === 'a' ? aPos : bPos
  const vx = key === 'a' ? 'ax' : 'bx'
  const vy = key === 'a' ? 'ay' : 'by'
  const r = Math.hypot(pos.value.x, pos.value.y)
  const maxR = STADIUM_R - BEY_R
  if (r > maxR) {
    const nx = pos.value.x / r
    const ny = pos.value.y / r
    pos.value.x = nx * maxR
    pos.value.y = ny * maxR
    // Reflect with retention (wall ride feel)
    const d = phys[vx] * nx + phys[vy] * ny
    phys[vx] -= 2 * d * nx * 0.95
    phys[vy] -= 2 * d * ny * 0.95
    // Tangential chaos (drift along wall)
    const tangent = (Math.random() - 0.5) * WALL_BOOST * 2
    phys[vx] += -ny * tangent
    phys[vy] += nx * tangent
    // Boost spin from wall slam
    if (key === 'a') phys.aSpin = Math.min(phys.aFrameStart + 3, phys.aSpin + 3)
    else phys.bSpin = Math.min(phys.bFrameStart + 3, phys.bSpin + 3)
    // Wall sparks
    const sparkColors = ['#fbbf24', '#f97316', '#ffffff']
    for (let i = 0; i < 5; i++) {
      const angle = Math.atan2(-ny, -nx) + (Math.random() - 0.5) * 1.2
      const speed = 1.5 + Math.random() * 2
      sparks.value.push({
        id: sparkId++,
        x: nx * maxR,
        y: ny * maxR,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        size: 2 + Math.random() * 2
      })
    }
  }
}

function finishBattle() {
  phase.value = 'result'
  timers.push(setTimeout(() => {
    showResult.value = true
    emit('finish', winner.value)
  }, 600))
}

function rematch() {
  clearTimers()
  phase.value = 'idle'
  showResult.value = false
  aPos.value = { x: 0, y: 0 }
  bPos.value = { x: 0, y: 0 }
  aRot.value = 0
  bRot.value = 0
  aScale.value = 1
  bScale.value = 1
  aOpacity.value = 1
  bOpacity.value = 1
  clashTick.value = 0
  collisionCount.value = 0
  sparks.value = []
  phys.aStopped = false
  phys.bStopped = false
}

onMounted(() => { /* nothing auto-starts */ })
onUnmounted(() => {
  if (raf) cancelAnimationFrame(raf)
  clearTimers()
})

// Reset to idle when products change — user must click Launch again
watch(() => [props.a?.id, props.b?.id], () => rematch())

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

    <!-- Stadium floor + collision wall (visible) — sized to match physics constants -->
    <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div
        class="relative rounded-full"
        :style="{
          width: (STADIUM_R * 2) + 'px',
          height: (STADIUM_R * 2) + 'px',
          maxWidth: '90%',
          maxHeight: '90%',
          aspectRatio: '1 / 1'
        }"
      >
        <!-- Stadium floor (subtle gradient like a real beystadium bowl) -->
        <div
          class="absolute inset-0 rounded-full"
          style="background: radial-gradient(circle at 50% 50%, rgba(99,102,241,0.18) 0%, rgba(67,56,202,0.10) 55%, rgba(11,16,32,0.4) 100%);"
        ></div>
        <!-- Stadium wall (the actual collision boundary) -->
        <div
          class="absolute inset-0 rounded-full"
          style="border: 3px solid rgba(251,191,36,0.55); box-shadow: inset 0 0 24px rgba(251,191,36,0.18), 0 0 18px rgba(251,191,36,0.15);"
        ></div>
        <!-- Inner concentric guide ring -->
        <div
          class="absolute inset-[18%] rounded-full"
          style="border: 1px dashed rgba(165,180,252,0.20);"
        ></div>
      </div>
    </div>

    <div class="relative aspect-[16/9] sm:aspect-[21/9]">
      <!-- VS label -->
      <div class="absolute left-1/2 top-3 -translate-x-1/2 z-10">
        <span class="font-display text-2xl tracking-[0.4em] text-accent-gold/60">VS</span>
      </div>

      <!-- Collision counter (top-right) -->
      <div v-if="phase === 'clashing'" class="absolute right-3 top-3 z-10 rounded-full bg-storm/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-gold backdrop-blur">
        {{ collisionCount }} {{ collisionCount === 1 ? 'hit' : 'hits' }}
      </div>

      <!-- Bey A -->
      <div
        class="absolute left-1/2 top-1/2 z-10"
        :style="{
          transform: `translate(calc(-50% + ${aPos.x}px), calc(-50% + ${aPos.y}px)) scale(${aScale})`,
          opacity: aOpacity,
          transition: 'transform 0.08s linear'
        }"
      >
        <div class="relative h-20 w-20 sm:h-28 sm:w-28">
          <div
            class="streak absolute inset-0"
            :class="phys.aStopped ? '' : 'animate-spin-fast'"
            :style="{ animationDuration: `${Math.max(0.1, 0.5 - phys.aSpin * 0.02)}s` }"
          ></div>
          <img
            v-if="aImgOk && safeImg(a)"
            :src="safeImg(a)"
            :alt="a.title"
            class="absolute inset-0 m-auto h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
            :style="{ transform: `rotate(${aRot}deg)` }"
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
        class="absolute left-1/2 top-1/2 z-10"
        :style="{
          transform: `translate(calc(-50% + ${bPos.x}px), calc(-50% + ${bPos.y}px)) scale(${bScale})`,
          opacity: bOpacity,
          transition: 'transform 0.08s linear'
        }"
      >
        <div class="relative h-20 w-20 sm:h-28 sm:w-28">
          <div
            class="streak absolute inset-0"
            :class="phys.bStopped ? '' : 'animate-spin-fast'"
            :style="{ animationDuration: `${Math.max(0.1, 0.5 - phys.bSpin * 0.02)}s` }"
          ></div>
          <img
            v-if="bImgOk && safeImg(b)"
            :src="safeImg(b)"
            :alt="b.title"
            class="absolute inset-0 m-auto h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)]"
            :style="{ transform: `rotate(${bRot}deg)` }"
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

      <!-- Spark particles from collisions -->
      <div
        v-for="s in sparks"
        :key="s.id"
        class="absolute pointer-events-none z-20 rounded-full"
        :style="{
          left: 'calc(50% + ' + s.x + 'px)',
          top: 'calc(50% + ' + s.y + 'px)',
          width: s.size + 'px',
          height: s.size + 'px',
          background: s.color,
          boxShadow: '0 0 ' + (s.size * 2) + 'px ' + s.color,
          opacity: s.life,
          transform: 'translate(-50%, -50%) scale(' + s.life + ')'
        }"
      ></div>

      <!-- Countdown overlay -->
      <div
        v-if="phase === 'countdown'"
        class="absolute inset-0 z-30 flex items-center justify-center bg-storm/60 backdrop-blur-sm"
      >
        <div :key="countdown" class="font-display text-9xl text-white drop-shadow-[0_0_30px_rgba(251,191,36,0.9)] animate-pop-in">
          {{ countdown }}
        </div>
      </div>

      <!-- Idle overlay -->
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
          <div class="mt-1 text-[10px] uppercase tracking-widest text-slate-500">
            {{ collisionCount }} {{ collisionCount === 1 ? 'hit' : 'hits' }} in {{ Math.round(phys.aFrames / 60 * 10) / 10 }}s
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
</style>
