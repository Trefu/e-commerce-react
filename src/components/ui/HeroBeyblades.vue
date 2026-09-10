<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  main: { type: String, required: true },
  mainAlt: { type: String, default: 'Hero Beyblade' },
  orbiters: { type: Array, default: () => [] },
  size: { type: Number, default: 480 }
})

const stage = ref(null)
const parallaxX = ref(0)
const parallaxY = ref(0)
const stageSize = ref(0)
let raf
let targetX = 0
let targetY = 0
let ro

function onMove(e) {
  const rect = stage.value?.getBoundingClientRect()
  if (!rect) return
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  targetX = (e.clientX - cx) / rect.width
  targetY = (e.clientY - cy) / rect.height
}

function loop() {
  parallaxX.value += (targetX - parallaxX.value) * 0.08
  parallaxY.value += (targetY - parallaxY.value) * 0.08
  raf = requestAnimationFrame(loop)
}

function syncStageSize() {
  if (!stage.value) return
  stageSize.value = stage.value.getBoundingClientRect().width
}

// orbit radii are % of stage size; computed reactively
function radiusPx(b) {
  const r = String(b.radius || '0')
  if (r.endsWith('%')) {
    return Math.round(stageSize.value * (parseFloat(r) / 100))
  }
  return parseFloat(r)
}

onMounted(() => {
  syncStageSize()
  if (typeof ResizeObserver !== 'undefined' && stage.value) {
    ro = new ResizeObserver(() => syncStageSize())
    ro.observe(stage.value)
  } else {
    window.addEventListener('resize', syncStageSize)
  }
  window.addEventListener('mousemove', onMove, { passive: true })
  raf = requestAnimationFrame(loop)
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  if (raf) cancelAnimationFrame(raf)
  if (ro) ro.disconnect()
  else window.removeEventListener('resize', syncStageSize)
})

// Pre-compute spark particles around the center
const sparkColors = ['#fbbf24', '#f97316', '#ef4444', '#a78bfa', '#38bdf8', '#22d3ee', '#f472b6']
const sparks = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2
  const dist = 90 + Math.random() * 70
  return {
    tx: Math.cos(angle) * dist,
    ty: Math.sin(angle) * dist,
    delay: (i * 0.11).toFixed(2),
    dur: (1.2 + Math.random() * 1.0).toFixed(2),
    color: sparkColors[i % sparkColors.length],
    size: 3 + Math.round(Math.random() * 5)
  }
})

const ringScales = [1.15, 1.0, 0.85]
const ringDurs = ['28s', '20s', '34s']
</script>

<template>
  <div
    ref="stage"
    class="hero-stage relative mx-auto"
    :style="{
      width: 'min(' + size + 'px, 100%)',
      aspectRatio: '1 / 1',
      maxWidth: '100%',
      transform: `translate3d(${parallaxX * 18}px, ${parallaxY * 18}px, 0)`
    }"
  >
    <!-- Background radial glow -->
    <div class="absolute inset-0 rounded-full pointer-events-none"
      style="background: radial-gradient(circle at 50% 50%, rgba(99,102,241,0.18), transparent 60%);"></div>

    <!-- Outer rotating stadium rings -->
    <div class="absolute inset-0 rounded-full pointer-events-none"
      :style="{ transform: `scale(${ringScales[0]})`, animation: `spin-cw ${ringDurs[0]} linear infinite` }">
      <div class="w-full h-full rounded-full"
        style="border: 1px dashed rgba(165,180,252,0.45);"></div>
    </div>
    <div class="absolute inset-0 rounded-full pointer-events-none"
      :style="{ transform: `scale(${ringScales[1]})`, animation: `spin-ccw ${ringDurs[1]} linear infinite` }">
      <div class="w-full h-full rounded-full"
        style="border: 1px solid rgba(251,191,36,0.45); box-shadow: inset 0 0 30px rgba(251,191,36,0.2);"></div>
    </div>
    <div class="absolute inset-0 rounded-full pointer-events-none"
      :style="{ transform: `scale(${ringScales[2]})`, animation: `spin-cw ${ringDurs[2]} linear infinite` }">
      <div class="w-full h-full rounded-full"
        style="border: 1px dashed rgba(56,189,248,0.4);"></div>
    </div>

    <!-- Pulsing glow -->
    <div class="absolute inset-0 rounded-full pointer-events-none animate-pulse-glow"
      style="background: radial-gradient(circle at 50% 50%, rgba(251,191,36,0.25), transparent 55%);"></div>

    <!-- Shockwave rings -->
    <div class="hero-shockwave" style="animation-delay: 0s;"></div>
    <div class="hero-shockwave" style="animation-delay: 0.9s;"></div>
    <div class="hero-shockwave" style="animation-delay: 1.8s; border-color: rgba(251,191,36,0.5);"></div>

    <!-- Orbiters -->
    <div
      v-for="(b, i) in orbiters"
      :key="'orb-' + i"
      class="hero-orbit"
      :class="b.direction === 'ccw' ? 'ccw' : ''"
      :style="{
        '--orbit-d': b.speed + 's',
        opacity: b.opacity ?? 1
      }"
    >
      <div
        class="hero-orbit-position"
        :style="{ '--orbit-r': radiusPx(b) + 'px' }"
      >
        <div
          class="hero-orbit-spin relative"
          :style="{
            width: b.size + 'px',
            height: b.size + 'px',
            '--spin-self': b.spin || '1.6s',
            animationDuration: (b.spin || '1.6s')
          }"
        >
          <img
            :src="b.src"
            :alt="b.alt || 'Beyblade'"
            class="absolute inset-0 w-full h-full object-contain"
            draggable="false"
            :style="{ filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.55))' }"
          />
          <div
            class="hero-streak absolute inset-0"
            :class="b.streak || ''"
          ></div>
        </div>
      </div>
    </div>

    <!-- Sparks -->
    <div
      v-for="(s, i) in sparks"
      :key="'sp-' + i"
      class="hero-spark"
      :style="{
        '--tx': s.tx + 'px',
        '--ty': s.ty + 'px',
        '--spark-delay': s.delay + 's',
        '--spark-d': s.dur + 's',
        '--spark-color': s.color,
        '--spark-size': s.size + 'px'
      }"
    ></div>

    <!-- Inner stadium floor (subtle) — must be BEFORE center blade so it doesn't cover it -->
    <div class="absolute rounded-full ring-stadium pointer-events-none"
      :style="{ inset: '18%' }"></div>

    <!-- Center main Beyblade — rendered LAST so it sits on top of all layers -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        class="relative main-blade rounded-full overflow-hidden animate-breath"
        :style="{
          width: '62%',
          height: '62%',
          backgroundImage: `url(${main})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: 'inset 0 0 0 2px rgba(251,191,36,0.55), 0 0 40px rgba(99,102,241,0.35)'
        }"
      >
        <!-- Streak ring overlay (rotates independently) -->
        <div class="hero-streak animate-spin-crazy pointer-events-none" style="animation-duration: 2.2s;"></div>

        <!-- Vignette on edges only -->
        <div class="absolute inset-0 rounded-full pointer-events-none"
          style="background: radial-gradient(circle at 50% 50%, transparent 55%, rgba(11,16,32,0.6) 100%);"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-stage {
  --base: 480px;
}

.main-blade {
  width: 62%;
  height: 62%;
}

.hero-orbit-spin {
  animation: spin-cw var(--spin-self, 1.6s) linear infinite;
}

.hero-orbit.ccw .hero-orbit-spin {
  animation: spin-ccw var(--spin-self, 1.6s) linear infinite;
}

.hero-stage img {
  user-select: none;
  -webkit-user-drag: none;
}
</style>
