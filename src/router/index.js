import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { title: 'Let It Rip · Premium Beyblade Store' }
  },
  {
    path: '/shop',
    name: 'shop',
    component: () => import('@/pages/ShopPage.vue'),
    meta: { title: 'Shop · Let It Rip' }
  },
  {
    path: '/shop/:category',
    name: 'shop-category',
    component: () => import('@/pages/ShopPage.vue'),
    meta: { title: 'Shop · Let It Rip' }
  },
  {
    path: '/product/:id',
    name: 'product',
    component: () => import('@/pages/ProductPage.vue'),
    meta: { title: 'Product · Let It Rip' }
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/pages/CartPage.vue'),
    meta: { title: 'Cart · Let It Rip' }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/pages/CheckoutPage.vue'),
    meta: { title: 'Checkout · Let It Rip', requiresCart: true }
  },
  {
    path: '/order/:id',
    name: 'order',
    component: () => import('@/pages/OrderConfirmationPage.vue'),
    meta: { title: 'Order confirmed · Let It Rip' }
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/pages/OrdersPage.vue'),
    meta: { title: 'My orders · Let It Rip', requiresAuth: true }
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: () => import('@/pages/WishlistPage.vue'),
    meta: { title: 'Wishlist · Let It Rip' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { title: 'Sign in · Let It Rip' }
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/pages/SignupPage.vue'),
    meta: { title: 'Create account · Let It Rip' }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/pages/AboutPage.vue'),
    meta: { title: 'About · Let It Rip' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/NotFoundPage.vue'),
    meta: { title: 'Lost in the stadium · Let It Rip' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title
  }
  const auth = useAuthStore()
  if (to.meta?.requiresAuth && !auth.user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta?.requiresCart) {
    const cart = JSON.parse(localStorage.getItem('let-it-rip:cart') || '[]')
    if (!cart.length) return { name: 'cart' }
  }
  return true
})

export default router
