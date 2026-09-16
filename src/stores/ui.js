import { defineStore } from 'pinia'

const LS_KEY = 'let-it-rip:ui'

let id = 0

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
    paletteOpen: false
  }),
  actions: {
    init() {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        this.paletteOpen = !!parsed.paletteOpen
      } catch {}
    },
    persist() {
      localStorage.setItem(LS_KEY, JSON.stringify({ paletteOpen: this.paletteOpen }))
    },
    toast({ title, content = '', color = 'indigo', duration = 2800, icon = null }) {
      const toastId = ++id
      this.toasts.push({ id: toastId, title, content, color, icon })
      setTimeout(() => this.dismiss(toastId), duration)
      return toastId
    },
    dismiss(toastId) {
      this.toasts = this.toasts.filter(t => t.id !== toastId)
    },
    openPalette() { this.paletteOpen = true; this.persist() },
    closePalette() { this.paletteOpen = false; this.persist() },
    togglePalette() { this.paletteOpen = !this.paletteOpen; this.persist() },
    mountKeybinds() {
      window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault()
          this.togglePalette()
        }
        if (e.key === 'Escape' && this.paletteOpen) {
          this.closePalette()
        }
      })
    }
  }
})
