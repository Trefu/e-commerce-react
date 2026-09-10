import { defineStore } from 'pinia'
import { useUiStore } from './ui'
import { getProductById } from '@/data/products'

const LS_KEY = 'let-it-rip:cart'
const PROMO_CODES = {
  'LETITRIP10': { type: 'percent', value: 10, label: '10% off' },
  'STORM20':    { type: 'percent', value: 20, label: '20% off — Storm sale' },
  'BLADE5':     { type: 'flat',    value: 5,  label: '$5 off' }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    promo: null,
    shipping: 'standard'
  }),
  getters: {
    count: (state) => state.items.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0),
    subtotal(state) {
      return +state.items
        .reduce((acc, i) => acc + (Number(i.price) || 0) * (Number(i.quantity) || 0), 0)
        .toFixed(2)
    },
    shippingCost(state) {
      if (state.subtotal === 0) return 0
      if (state.subtotal >= 75) return 0
      return state.shipping === 'express' ? 9.99 : 4.99
    },
    discount(state) {
      if (!state.promo) return 0
      const p = PROMO_CODES[state.promo]
      if (!p) return 0
      if (p.type === 'percent') return +(state.subtotal * (p.value / 100)).toFixed(2)
      return Math.min(p.value, state.subtotal)
    },
    total() {
      const v = (this.subtotal || 0) + (this.shippingCost || 0) - (this.discount || 0)
      return +v.toFixed(2)
    }
  },
  actions: {
    init() {
      try {
        const raw = localStorage.getItem(LS_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          this.items = parsed.items || []
          this.promo = parsed.promo || null
          this.shipping = parsed.shipping || 'standard'
        }
      } catch {}
      // Repair: legacy cart items stored only {id, quantity, addedAt}.
      // Backfill price/title/image from the current catalog so subtotal
      // never evaluates NaN. Items that can't be resolved are kept with
      // safe defaults (price 0) so the UI still renders them.
      this.items = this.items
        .filter(Boolean)
        .map(i => {
          const product = getProductById(i.id)
          const safePrice = Number(i.price) || (product ? Number(product.price) || 0 : 0)
          return {
            id: i.id,
            quantity: Number(i.quantity) || 1,
            addedAt: i.addedAt || Date.now(),
            price: safePrice,
            title: i.title || product?.title || `Item ${String(i.id).slice(-6)}`,
            image: i.image || product?.images?.[0] || product?.image || '/beyblades/hero.svg'
          }
        })
    },
    persist() {
      localStorage.setItem(LS_KEY, JSON.stringify({
        items: this.items,
        promo: this.promo,
        shipping: this.shipping
      }))
    },
    add(product, quantity = 1) {
      const ui = useUiStore()
      const fresh = getProductById(product.id) || product
      if (fresh.stock <= 0) {
        ui.toast({ title: 'Out of stock', content: `${fresh.title} is unavailable.`, color: 'red' })
        return
      }
      const snapshot = {
        id: fresh.id,
        quantity,
        addedAt: Date.now(),
        price: Number(fresh.price) || 0,
        title: fresh.title || 'Beyblade',
        image: fresh.images?.[0] || fresh.image || '/beyblades/hero.svg'
      }
      const existing = this.items.find(i => i.id === fresh.id)
      if (existing) {
        if (existing.quantity + quantity > fresh.stock) {
          ui.toast({ title: 'Max stock', content: `Only ${fresh.stock} available.`, color: 'red' })
          return
        }
        existing.quantity += quantity
        // Keep price/title/image up to date if they were missing
        existing.price = snapshot.price
        existing.title = snapshot.title
        existing.image = snapshot.image
        ui.toast({ title: 'Added', content: `${snapshot.title} (×${existing.quantity})`, color: 'green', icon: '✓' })
      } else {
        this.items.push(snapshot)
        ui.toast({ title: 'Added to cart', content: `${snapshot.title}`, color: 'green', icon: '✓' })
      }
      this.persist()
    },
    setQuantity(id, quantity) {
      const item = this.items.find(i => i.id === id)
      if (!item) return
      const fresh = getProductById(id)
      const max = fresh?.stock ?? 99
      if (quantity < 1) return this.remove(id)
      if (quantity > max) {
        item.quantity = max
        useUiStore().toast({ title: 'Max stock', content: `Only ${max} available.`, color: 'red' })
      } else {
        item.quantity = quantity
      }
      this.persist()
    },
    increment(id) {
      const item = this.items.find(i => i.id === id)
      if (item) this.setQuantity(id, item.quantity + 1)
    },
    decrement(id) {
      const item = this.items.find(i => i.id === id)
      if (item) this.setQuantity(id, item.quantity - 1)
    },
    remove(id) {
      const item = this.items.find(i => i.id === id)
      this.items = this.items.filter(i => i.id !== id)
      const ui = useUiStore()
      ui.toast({
        title: 'Removed',
        content: item ? `${getProductById(id)?.title || 'Item'} taken out.` : 'Item removed',
        color: 'red', icon: '×'
      })
      this.persist()
    },
    clear() {
      this.items = []
      this.persist()
    },
    applyPromo(code) {
      const ui = useUiStore()
      const up = code.trim().toUpperCase()
      if (PROMO_CODES[up]) {
        this.promo = up
        ui.toast({ title: 'Promo applied', content: PROMO_CODES[up].label, color: 'green' })
      } else {
        this.promo = null
        ui.toast({ title: 'Invalid code', content: 'Try LETITRIP10, STORM20 or BLADE5.', color: 'red' })
      }
      this.persist()
    },
    clearPromo() {
      this.promo = null
      this.persist()
    },
    setShipping(s) {
      this.shipping = s
      this.persist()
    }
  }
})
