<script setup>
const props = defineProps({
  type: { type: String, default: 'Attack' },
  size: { type: String, default: 'md' }, // sm | md
  glow: { type: Boolean, default: true }
})

const palette = {
  Attack:  { bg: 'bg-accent-red/15',   text: 'text-accent-red',   border: 'border-accent-red/40',   icon: '⚔' },
  Defense: { bg: 'bg-accent-blue/15',  text: 'text-accent-blue',  border: 'border-accent-blue/40',  icon: '🛡' },
  Stamina: { bg: 'bg-accent-green/15', text: 'text-accent-green', border: 'border-accent-green/40', icon: '∞' },
  Balance: { bg: 'bg-rip-500/15',      text: 'text-rip-300',      border: 'border-rip-400/40',      icon: '◆' },
  Starter: { bg: 'bg-accent-gold/15',  text: 'text-accent-gold',  border: 'border-accent-gold/40',  icon: '★' },
  Launcher:{ bg: 'bg-white/10',        text: 'text-slate-200',    border: 'border-white/20',        icon: '➤' },
  Parts:   { bg: 'bg-accent-gold/15',  text: 'text-accent-gold',  border: 'border-accent-gold/40',  icon: '⚙' }
}

const tone = palette[props.type] || palette.Balance
const sizing = props.size === 'sm'
  ? 'px-2 py-0.5 text-[10px]'
  : 'px-2.5 py-1 text-xs'
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 rounded-full border font-bold uppercase tracking-widest',
      tone.bg, tone.text, tone.border, sizing,
      glow && 'shadow-[0_0_15px_rgba(255,255,255,0.04)]'
    ]"
  >
    <span aria-hidden="true">{{ tone.icon }}</span>
    <span>{{ type }}</span>
  </span>
</template>
