<script setup>
import { useId } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'wave',
    validator: v => ['wave', 'glow', 'fade'].includes(v)
  },
  height: {
    type: String,
    default: '120px'
  },
  flip: {
    type: Boolean,
    default: false
  },
  fromColor: {
    type: String,
    default: 'rgba(11,16,32,0)'
  },
  toColor: {
    type: String,
    default: 'rgba(11,16,32,1)'
  }
})

const uid = useId()
const strokeId = `dividerStroke-${uid}`
const fillId = `dividerFill-${uid}`
</script>

<template>
  <div
    class="section-divider"
    :class="[`variant-${variant}`, flip ? 'is-flipped' : '']"
    :style="{
      '--divider-h': height,
      '--divider-from': fromColor,
      '--divider-to': toColor
    }"
    aria-hidden="true"
  >
    <svg
      v-if="variant === 'wave'"
      class="section-divider__svg"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient :id="strokeId" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stop-color="rgba(251,191,36,0)" />
          <stop offset="50%"  stop-color="rgba(251,191,36,0.55)" />
          <stop offset="100%" stop-color="rgba(251,191,36,0)" />
        </linearGradient>
        <linearGradient :id="fillId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   :stop-color="toColor" stop-opacity="0" />
          <stop offset="100%" :stop-color="toColor" stop-opacity="1" />
        </linearGradient>
      </defs>
      <path
        d="M0,64 C240,120 480,8 720,40 C960,72 1200,120 1440,56 L1440,120 L0,120 Z"
        :fill="`url(#${fillId})`"
      />
      <path
        d="M0,64 C240,120 480,8 720,40 C960,72 1200,120 1440,56"
        fill="none"
        :stroke="`url(#${strokeId})`"
        stroke-width="1.5"
      />
    </svg>

    <div v-else-if="variant === 'glow'" class="section-divider__glow" />

    <span v-else class="section-divider__bar" />
  </div>
</template>

<style scoped>
.section-divider {
  position: relative;
  width: 100%;
  height: var(--divider-h, 120px);
  pointer-events: none;
  display: block;
  margin-top: -1px;
  margin-bottom: -1px;
}

.section-divider__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.section-divider__glow {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(640px, 80%);
  height: 100%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    ellipse 50% 50% at 50% 50%,
    rgba(251, 191, 36, 0.55) 0%,
    rgba(217, 119, 6, 0.18) 55%,
    rgba(217, 119, 6, 0) 100%
  );
  filter: blur(18px);
  pointer-events: none;
}

.section-divider__bar {
  position: absolute;
  left: 50%;
  top: 50%;
  width: min(640px, 80%);
  height: 1px;
  transform: translate(-50%, -50%);
  background: linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent);
  box-shadow: 0 0 18px rgba(251,191,36,0.35);
}

.section-divider.is-flipped {
  transform: scaleY(-1);
}

@media (prefers-reduced-motion: reduce) {
  .section-divider { display: none; }
}
</style>
