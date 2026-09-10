# 🌀 Let It Rip · Beyblade Store

A full end-to-end **e-commerce** for Beyblades, **refactored from React to Vue 3**.
Original project: `e-commerce-react` (Craco + Context + Tailwind).
Refactor: **Vite + Vue 3 + Pinia + Vue Router + Tailwind 3**, with custom animations and a real Beyblade catalog.

## ✨ Highlights

| Feature | Detail |
| --- | --- |
| **Stack** | Vue 3 (Composition API + `<script setup>`), Vite 5, Pinia, Vue Router 4, Tailwind 3 |
| **State** | Pinia stores — `products`, `cart`, `wishlist`, `auth`, `orders`, `ui` — all persisted to `localStorage` |
| **Catalog** | 14+ Beyblades (Burst / Metal Fight / Pro / Starters / Parts) with images from the Beyblade Fandom Wiki (Wikia) |
| **Search** | Cmd/Ctrl + K command palette, live filters (category, price, sort) |
| **Cart** | Add / decrement / remove, shipping method, promo codes (`LETITRIP10`, `STORM20`, `BLADE5`), free-shipping threshold |
| **Checkout** | 3-step wizard (info → shipping/payment → review), validated forms, card formatting |
| **Orders** | Persistent order history, animated timeline, demo status-advance |
| **Auth** | Local-only auth (signup/login) with seeded demo account |
| **Wishlist** | Persistent across reloads, accessible from navbar |
| **404** | Custom spinning-Beyblade 404 page |

## 🎨 Unique animations

- **BeybladeSpinner** with conic-gradient streak trail (slow / fast / wobble modes)
- **3D-tilt product cards** that respond to mouse with parallax image + layered ring system
- **Confetti burst** on buy / order confirmation
- **Marquee** in the footer with rotating Beyblade facts
- **Reveal-on-scroll** IntersectionObserver directive + component
- **Animated stadium ring** in the hero with mouse parallax
- **Page transitions** (blur + slide) on every route
- **Toast stack** with shimmer progress + 3D entry/exit
- **Skeleton shimmer** during initial load
- **Pulse ring** on "live" chips and `animate-tilt-shake` on cart icon when filled
- **Reduce-motion** friendly (respects `prefers-reduced-motion`)

## 🗂 Project layout

```
src/
├─ App.vue                  shell + router-view transition + global ambient lights
├─ main.js                  bootstrap, Pinia, hydration of persisted stores
├─ router/                  routes + auth/requires-cart guards + dynamic titles
├─ stores/                  Pinia stores (products/cart/auth/orders/wishlist/ui)
├─ data/products.js         catalog with real Beyblade image URLs
├─ components/
│  ├─ layout/               AppNavbar, AppFooter
│  ├─ ui/                   BeybladeSpinner, ToastStack, CommandPalette, RevealOnScroll, StarRating, ProgressRing
│  └─ ProductCard.vue       3D-tilt card used everywhere
├─ pages/                   Home / Shop / Product / Cart / Checkout / OrderConfirmation / Orders / Wishlist / Login / Signup / About / 404
└─ assets/main.css          tailwind + custom animations + scrollbars + skeletons
```

## ▶️ Develop

```bash
npm install
npm run dev
```

Open <http://localhost:5173>.

## 🏗 Build

```bash
npm run build
npm run preview
```

## 🧪 Demo account

| Email | Password |
| --- | --- |
| `demo@letitrip.test` | `demo1234` |

Or sign up with any email/password.

## 🔁 Refactor notes (React → Vue)

| Original (React) | Refactor (Vue 3) |
| --- | --- |
| `React Context` (`UiContext`, `CartContext`, `ProductsContext`) | Pinia stores with `localStorage` persistence |
| `react-router-dom v5` `<Switch>` + `<Route>` | `vue-router` v4 with guards and lazy imports |
| `react-hook-form` | Local `reactive` form with manual validation |
| `react-loadingg` Spinner | Custom `BeybladeSpinner.vue` |
| Craco + Webpack | Vite 5 with HMR |
| `firebase` (unused after deletion) | Removed — replaced with local-only persistence |
| Card / Navbar / Footer JSX | `.vue` SFC with `<script setup>` |

Let it rip. 🌀
