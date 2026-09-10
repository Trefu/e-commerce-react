import { defineStore } from 'pinia'

const LS_KEY = 'let-it-rip:wishlist'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    items: []
  }),
  getters: {
    count: (state) => state.items.length,
    has: (state) => (id) => state.items.includes(id)
  },
  actions: {
    init() {
      try {
        const raw = localStorage.getItem(LS_KEY)
        if (raw) this.items = JSON.parse(raw) || []
      } catch {}
    },
    persist() {
      localStorage.setItem(LS_KEY, JSON.stringify(this.items))
    },
    toggle(id) {
      if (this.has(id)) {
        this.items = this.items.filter(i => i !== id)
      } else {
        this.items.push(id)
      }
      this.persist()
    }
  }
})
