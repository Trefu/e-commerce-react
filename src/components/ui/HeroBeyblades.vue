<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  image: { type: String, default: '/products/img_0132-c3a1207e03635688e417234948970263.webp.png' },
  alt:   { type: String, default: 'Beyblade' },
  size:  { type: Number, default: 460 }
})

const stage = ref(null)
const parallaxX = ref(0)
const parallaxY = ref(0)
let raf
let targetX = 0
let targetY = 0
let ro

function onMove(e) {
  if (!stage.value) return
  const rect = stage.value.getBoundingClientRect()
  targetX = (e.clientX - rect.left) / rect.width - 0.5
  targetY = (e.clientY - rect.top)  / rect.height - 0.5
}

function loop() {
  parallaxX.value += (targetX - parallaxX.value) * 0.08
  parallaxY.value += (targetY - parallaxY.value) * 0.08
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  window.addEventListener('mousemove', onMove, { passive: true })
  raf = requestAnimationFrame(loop)
  if (typeof ResizeObserver !== 'undefined' && stage.value) {
    ro = new ResizeObserver(() => {})
    ro.observe(stage.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  if (raf) cancelAnimationFrame(raf)
  if (ro) ro.disconnect()
})

// Orbiting sparkle particles around the center
const sparkColors = ['#fbbf24', '#f97316', '#ef4444', '#a78bfa', '#38bdf8', '#22d3ee', '#f472b6']
const sparks = Array.from({ length: 12 }, (_, i) => {
  const angle = (i / 12) * Math.PI * 2
  const dist = 130 + Math.random() * 50
  return {
    tx: Math.cos(angle) * dist,
    ty: Math.sin(angle) * dist,
    delay: (i * 0.13).toFixed(2),
    dur: (1.4 + Math.random() * 1.0).toFixed(2),
    color: sparkColors[i % sparkColors.length],
    size: 3 + Math.round(Math.random() * 4)
  }
})
</script>

<template>
  <div
    ref="stage"
    class="hero-stage relative isolate mx-auto"
    :style="{
      width: 'min(' + size + 'px, 92vw)',
      aspectRatio: '1 / 1',
      maxWidth: '100%'
    }"
  >
    <!-- Soft outer halo (follows cursor) -->
    <div
      class="pointer-events-none absolute inset-0 rounded-full"
      :style="{
        background: 'radial-gradient(circle at ' + (50 + parallaxX * 30) + '% ' + (50 + parallaxY * 30) + '%, rgba(99,102,241,0.32), transparent 60%)',
        transform: 'translate3d(' + (parallaxX * 14) + 'px, ' + (parallaxY * 14) + 'px, 0)'
      }"
    />

    <!-- Stadium ring 1 (rotates clockwise) -->
    <div class="hero-ring hero-ring--dashed pointer-events-none absolute inset-0"></div>
    <!-- Stadium ring 2 (rotates counter-clockwise, gold) -->
    <div class="hero-ring hero-ring--solid pointer-events-none absolute inset-[6%]"></div>
    <!-- Stadium ring 3 (rotates clockwise, fast) -->
    <div class="hero-ring hero-ring--dashed hero-ring--fast pointer-events-none absolute inset-[12%]"></div>

    <!-- Pulsing glow at center -->
    <div
      class="pointer-events-none absolute inset-0 rounded-full animate-pulse-glow"
      style="background: radial-gradient(circle at 50% 50%, rgba(251,191,36,0.22), transparent 55%);"
    ></div>

    <!-- Spark particles -->
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

    <!-- Center Beyblade — single image, transparent background, continuous spin -->
    <div
      class="absolute inset-0 flex items-center justify-center"
      :style="{
        transform: 'translate3d(' + (parallaxX * 22) + 'px, ' + (parallaxY * 22) + 'px, 0)'
      }"
    >
      <div class="hero-main-wrap">
        <img
          :src="image"
          :alt="alt"
          class="hero-main-img"
          draggable="false"
        />
        <div class="hero-main-streak"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-stage {
  overflow: visible;
}

/* Stadium rings */
.hero-ring {
  border-radius: 9999px;
  animation: hero-spin-cw 24s linear infinite;
}
.hero-ring--solid {
  border: 1px solid rgba(251,191,36,0.55);
  box-shadow:
    inset 0 0 36px rgba(251,191,36,0.22),
    0 0 30px rgba(251,191,36,0.18);
  animation: hero-spin-ccw 18s linear infinite;
}
.hero-ring--dashed {
  border: 1px dashed rgba(165,180,252,0.5);
}
.hero-ring--fast {
  animation: hero-spin-cw 9s linear infinite;
  border-color: rgba(56,189,248,0.4);
}

@keyframes hero-spin-cw  { to { transform: rotate(360deg); } }
@keyframes hero-spin-ccw { to { transform: rotate(-360deg); } }
@keyframes hero-pulse-glow {
  0%, 100% { transform: scale(1);   opacity: 0.6; }
  50%      { transform: scale(1.1); opacity: 1;   }
}
.animate-pulse-glow { animation: hero-pulse-glow 3.4s ease-in-out infinite; }

/* Center main blade wrapper */
.hero-main-wrap {
  position: relative;
  width: 66%;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-main-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  filter: drop-shadow(0 25px 40px rgba(0,0,0,0.55));
  animation: hero-blade-spin 2.4s linear infinite;
}

.hero-main-streak {
  position: absolute;
  inset: 6%;
  border-radius: 9999px;
  pointer-events: none;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(251,191,36,0.45) 60deg,
    transparent 120deg,
    transparent 360deg
  );
  -webkit-mask: radial-gradient(circle, transparent 38%, black 39%);
          mask: radial-gradient(circle, transparent 38%, black 39%);
  animation: hero-blade-spin 1.6s linear infinite;
  opacity: 0.7;
}

@keyframes hero-blade-spin {
  to { transform: rotate(360deg); }
}

/* Spark particles — fly outward from center */
.hero-spark {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--spark-size, 4px);
  height: var(--spark-size, 4px);
  margin-left: calc(var(--spark-size, 4px) / -2);
  margin-top:  calc(var(--spark-size, 4px) / -2);
  background: var(--spark-color, #fbbf24);
  border-radius: 9999px;
  box-shadow: 0 0 12px var(--spark-color, #fbbf24);
  animation: hero-spark-fly var(--spark-d, 1.6s) ease-out var(--spark-delay, 0s) infinite;
  pointer-events: none;
}

@keyframes hero-spark-fly {
  0%   { transform: translate(0,0) scale(1);   opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0.4); opacity: 0; }
}
</style>
