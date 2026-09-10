import { defineStore } from 'pinia'
import { getProductById } from '@/data/products'

const LS_KEY = 'let-it-rip:orders'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: []
  }),
  getters: {
    byId: (state) => (id) => state.orders.find(o => o.id === id) || null,
    forUser: (state) => (userId) =>
      userId ? state.orders.filter(o => o.userId === userId) : state.orders
  },
  actions: {
    init() {
      try {
        const raw = localStorage.getItem(LS_KEY)
        if (raw) this.orders = JSON.parse(raw) || []
      } catch {}
    },
    persist() {
      localStorage.setItem(LS_KEY, JSON.stringify(this.orders))
    },
    create(payload, cart, totals, user) {
      const id = 'LIR-' + Date.now().toString(36).toUpperCase()
      const items = cart.items.map(i => {
        const p = getProductById(i.id) || {}
        return {
          id: i.id,
          title: p.title || 'Item',
          image: p.images?.[0] || '',
          price: p.price || 0,
          quantity: i.quantity,
          subtotal: +( (p.price || 0) * i.quantity ).toFixed(2)
        }
      })
      const order = {
        id,
        createdAt: new Date().toISOString(),
        userId: user?.id || null,
        customer: {
          name: payload.name,
          email: payload.email,
          address: payload.address,
          city: payload.city,
          country: payload.country,
          zip: payload.zip
        },
        items,
        shipping: cart.shipping,
        shippingCost: cart.shippingCost,
        discount: cart.discount,
        promo: cart.promo,
        subtotal: cart.subtotal,
        total: totals,
        status: 'processing',
        timeline: [
          { label: 'Order placed', at: new Date().toISOString(), done: true },
          { label: 'Preparing shipment', at: null, done: false },
          { label: 'Out for delivery', at: null, done: false },
          { label: 'Delivered', at: null, done: false }
        ]
      }
      this.orders.unshift(order)
      this.persist()
      return order
    },
    advance(id) {
      const order = this.byId(id)
      if (!order) return
      const next = order.timeline.findIndex(t => !t.done)
      if (next < 0) return
      order.timeline[next].done = true
      order.timeline[next].at = new Date().toISOString()
      if (next === order.timeline.length - 1) order.status = 'delivered'
      else if (next === 0) order.status = 'preparing'
      else if (next === 1) order.status = 'shipping'
      this.persist()
    }
  }
})
