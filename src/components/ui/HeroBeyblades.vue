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
const isVisible = ref(true)
let raf
let targetX = 0
let targetY = 0
let ro
let io

function onMove(e) {
  if (!isVisible.value || !stage.value) return
  const rect = stage.value.getBoundingClientRect()
  targetX = (e.clientX - rect.left) / rect.width - 0.5
  targetY = (e.clientY - rect.top)  / rect.height - 0.5
}

function loop() {
  if (isVisible.value) {
    parallaxX.value += (targetX - parallaxX.value) * 0.08
    parallaxY.value += (targetY - parallaxY.value) * 0.08
    raf = requestAnimationFrame(loop)
  } else {
    raf = null
  }
}

function startLoop() {
  if (raf == null) raf = requestAnimationFrame(loop)
}

onMounted(() => {
  window.addEventListener('mousemove', onMove, { passive: true })
  startLoop()

  if (typeof IntersectionObserver !== 'undefined' && stage.value) {
    io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        isVisible.value = entry.isIntersecting
        if (isVisible.value) {
          targetX = 0
          targetY = 0
          startLoop()
        } else {
          parallaxX.value = 0
          parallaxY.value = 0
        }
      },
      { threshold: 0 }
    )
    io.observe(stage.value)
  }

  if (typeof ResizeObserver !== 'undefined' && stage.value) {
    ro = new ResizeObserver(() => {})
    ro.observe(stage.value)
  }
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  if (raf) cancelAnimationFrame(raf)
  if (ro) ro.disconnect()
  if (io) io.disconnect()
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
    <!-- Arena background (transparent PNG) — fits inside container so the
         whole arena is visible without clipping -->
    <img
      src="/arena.png"
      alt=""
      class="pointer-events-none absolute inset-[4%] h-[92%] w-[92%] rounded-full object-cover opacity-90"
      loading="lazy"
      decoding="async"
    />

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
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-stage {
  overflow: visible;
}

/* Pulsing glow */
@keyframes hero-pulse-glow {
  0%, 100% { transform: scale(1);   opacity: 0.6; }
  50%      { transform: scale(1.1); opacity: 1;   }
}
.animate-pulse-glow {
  animation: hero-pulse-glow 3.4s ease-in-out infinite !important;
  animation-iteration-count: infinite !important;
}

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
  animation: hero-blade-spin 2.4s linear infinite !important;
  animation-iteration-count: infinite !important;
  transform-origin: 50% 50%;
  will-change: transform;
}

@keyframes hero-blade-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
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
  animation: hero-spark-fly var(--spark-d, 1.6s) ease-out var(--spark-delay, 0s) infinite !important;
  animation-iteration-count: infinite !important;
  pointer-events: none;
  will-change: transform, opacity;
}

@keyframes hero-spark-fly {
  0%   { transform: translate(0,0) scale(1);   opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0.4); opacity: 0; }
}
</style>
