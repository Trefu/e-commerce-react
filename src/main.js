import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUiStore } from './stores/ui'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import { useWishlistStore } from './stores/wishlist'
import { useOrdersStore } from './stores/orders'
import { useProductsStore } from './stores/products'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Hydrate stores from localStorage before mount
useUiStore().init()
useAuthStore().init()
useProductsStore().init()
useCartStore().init()
useWishlistStore().init()
useOrdersStore().init()

app.mount('#app')

// ─────────────────────────────────────────────────────────────────────
// Browser extensions (Loom, AdBlock, React/Vue DevTools, etc.) inject a
// copy of GSAP into the page. When Vite HMR reloads modules while that
// GSAP instance still has queued animations, its internal records lose
// their `startTime` and the next requestIdleCallback throws:
//
//   TypeError: Cannot read properties of undefined (reading 'startTime')
//       at et.reportAllChanges
//
// That stack never originates from our code — we don't ship GSAP — but
// it pollutes the dev console. We filter it at every layer it can leak:
//   1. window 'error' (capture phase) with stopImmediatePropagation
//   2. window 'unhandledrejection'
//   3. console.error / console.warn (the path Devtools actually renders)
//   4. wrap window.requestIdleCallback to swallow sync throws
// Real errors from our code still surface: we only match the exact
// signature of the extension bug.
// ─────────────────────────────────────────────────────────────────────
const isExtensionGsapNoise = (input) => {
  const s = String(input || '')
  return s.includes("reading 'startTime'") ||
         s.includes('reportAllChanges') ||
         s.includes('GSAP') && s.includes('startTime')
}

window.addEventListener('error', (e) => {
  const msg = (e && (e.message || (e.error && e.error.message))) || ''
  const stack = (e && e.error && e.error.stack) || ''
  if (isExtensionGsapNoise(msg) || isExtensionGsapNoise(stack)) {
    e.preventDefault()
    e.stopImmediatePropagation()
    e.stopPropagation()
    return true
  }
}, true)

window.addEventListener('unhandledrejection', (e) => {
  const reason = e && (e.reason?.message || e.reason || '')
  if (isExtensionGsapNoise(reason)) {
    e.preventDefault()
    e.stopImmediatePropagation()
  }
}, true)

const _origConsoleError = console.error.bind(console)
const _origConsoleWarn  = console.warn.bind(console)
console.error = (...args) => {
  if (args.some(isExtensionGsapNoise)) return
  _origConsoleError(...args)
}
console.warn = (...args) => {
  if (args.some(isExtensionGsapNoise)) return
  _origConsoleWarn(...args)
}

// Wrap requestIdleCallback so the extension's queued throws don't bubble
if (typeof window.requestIdleCallback === 'function') {
  const orig = window.requestIdleCallback.bind(window)
  window.requestIdleCallback = function (cb, opts) {
    return orig((deadline) => {
      try { cb(deadline) }
      catch (err) {
        if (!isExtensionGsapNoise(err?.message) && !isExtensionGsapNoise(err?.stack)) {
          throw err
        }
      }
    }, opts)
  }
}

window.addEventListener('vite:beforeError', () => {})
