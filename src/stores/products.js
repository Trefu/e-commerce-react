import { defineStore } from 'pinia'
import { PRODUCTS } from '@/data/products'

const LS_KEY = 'let-it-rip:products'

export const useProductsStore = defineStore('products', {
  state: () => ({
    items: [],
    loaded: false,
    query: '',
    activeCategory: 'all',
    sort: 'featured',
    priceMin: 0,
    priceMax: 100
  }),
  getters: {
    maxPrice() {
      return Math.ceil(Math.max(...PRODUCTS.map(p => p.price), 1))
    },
    filtered(state) {
      let list = state.items.slice()
      if (state.activeCategory !== 'all') {
        list = list.filter(p => p.category === state.activeCategory)
      }
      if (state.query.trim()) {
        const q = state.query.toLowerCase()
        list = list.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.series.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q)
        )
      }
      list = list.filter(p => p.price >= state.priceMin && p.price <= state.priceMax)
      switch (state.sort) {
        case 'price-asc':  list.sort((a, b) => a.price - b.price); break
        case 'price-desc': list.sort((a, b) => b.price - a.price); break
        case 'rating':     list.sort((a, b) => b.rating - a.rating); break
        case 'newest':     list.sort((a, b) => (b.badge === 'New') - (a.badge === 'New')); break
        case 'power':      list.sort((a, b) => (b.power || 0) - (a.power || 0)); break
        default:           list.sort((a, b) => b.reviews - a.reviews)
      }
      return list
    },
    featured(state) {
      return state.items.filter(p => p.badge === 'Bestseller' || p.badge === 'Hot' || p.badge === 'New').slice(0, 6)
    },
    byId(state) {
      return (id) => state.items.find(p => p.id === id) || null
    },
    related(state) {
      return (product, limit = 4) => {
        if (!product) return []
        return state.items
          .filter(p => p.id !== product.id && p.category === product.category)
          .slice(0, limit)
      }
    }
  },
  actions: {
    init() {
      if (this.loaded) return
      // Simulate fetch for animation hooks
      setTimeout(() => {
        this.items = PRODUCTS
        this.loaded = true
      }, 350)
    },
    setQuery(q) { this.query = q },
    setCategory(c) { this.activeCategory = c },
    setSort(s) { this.sort = s },
    setPriceRange(min, max) { this.priceMin = min; this.priceMax = max },
    reset() {
      this.query = ''
      this.activeCategory = 'all'
      this.sort = 'featured'
      this.priceMin = 0
      this.priceMax = this.maxPrice
    }
  }
})
