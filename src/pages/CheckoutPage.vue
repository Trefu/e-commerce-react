<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useOrdersStore } from '@/stores/orders'
import { useAuthStore } from '@/stores/auth'
import { getProductById } from '@/data/products'
import RevealOnScroll from '@/components/ui/RevealOnScroll.vue'

const cart = useCartStore()
const orders = useOrdersStore()
const auth = useAuthStore()
const router = useRouter()

const step = ref(1) // 1 = info, 2 = shipping/payment, 3 = review

const form = reactive({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  address: '',
  city: '',
  country: 'Argentina',
  zip: '',
  shipping: 'standard',
  payment: 'card',
  card: '',
  expiry: '',
  cvc: ''
})

const errors = reactive({})

const detailed = computed(() => cart.items.map(i => ({
  ...i,
  ...getProductById(i.id)
})).filter(x => x.id))

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim()) errors.name = 'Name is required'
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errors.email = 'Invalid email'
  if (!form.address.trim()) errors.address = 'Address is required'
  if (!form.city.trim()) errors.city = 'City is required'
  if (!form.country.trim()) errors.country = 'Country is required'
  if (!/^\d{4,5}$/.test(form.zip)) errors.zip = 'Invalid zip'
  if (form.payment === 'card') {
    const digits = form.card.replace(/\s/g, '')
    if (!/^\d{13,19}$/.test(digits)) errors.card = 'Card number invalid'
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) errors.expiry = 'Use MM/YY'
    if (!/^\d{3,4}$/.test(form.cvc)) errors.cvc = 'Invalid CVC'
  }
  return Object.keys(errors).length === 0
}

function next() {
  if (!validate()) return
  cart.setShipping(form.shipping)
  step.value = Math.min(3, step.value + 1)
}

function back() { step.value = Math.max(1, step.value - 1) }

function formatCard(v) {
  return v.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})/g, '$1 ').trim()
}
function formatExpiry(v) {
  const d = v.replace(/\D/g, '').slice(0, 4)
  if (d.length < 3) return d
  return d.slice(0, 2) + '/' + d.slice(2)
}

const submitting = ref(false)
function placeOrder() {
  submitting.value = true
  setTimeout(() => {
    const order = orders.create(form, cart, cart.total, auth.user)
    cart.clear()
    cart.clearPromo()
    submitting.value = false
    router.push({ name: 'order', params: { id: order.id } })
  }, 700)
}
</script>

<template>
  <div v-if="!detailed.length" class="mx-auto max-w-2xl px-4 py-24 text-center">
    <p class="font-display text-3xl text-white">Your cart is empty.</p>
    <RouterLink to="/shop" class="btn-primary mt-6 inline-flex">Back to shop</RouterLink>
  </div>

  <div v-else class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <header class="mb-8">
      <p class="chip">Checkout</p>
      <h1 class="mt-2 font-display text-5xl text-white">Final lap</h1>
    </header>

    <!-- Stepper -->
    <ol class="mb-10 flex items-center justify-between gap-4 text-xs sm:text-sm">
      <li v-for="(label, i) in ['Information', 'Shipping & Payment', 'Review']" :key="label"
          class="flex flex-1 items-center gap-3"
          :class="step >= i + 1 ? 'text-white' : 'text-slate-500'">
        <span class="flex h-9 w-9 items-center justify-center rounded-full border transition"
              :class="step >= i + 1 ? 'border-rip-400 bg-rip-500/20 shadow-glow' : 'border-white/10'">
          {{ step > i + 1 ? '✓' : i + 1 }}
        </span>
        <span class="hidden sm:inline font-display tracking-widest">{{ label }}</span>
        <span v-if="i < 2" class="hidden flex-1 h-px bg-white/10 sm:inline-block"></span>
      </li>
    </ol>

    <div class="grid gap-8 lg:grid-cols-[1fr_400px]">
      <RevealOnScroll class="card-surface p-6 sm:p-8">
        <transition name="step" mode="out-in">
          <!-- Step 1 -->
          <div v-if="step === 1" key="info" class="space-y-4">
            <h2 class="font-display text-2xl text-white">Contact & shipping</h2>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="label">Full name</label>
                <input v-model="form.name" class="input" :class="errors.name && '!border-accent-red'" />
                <p v-if="errors.name" class="mt-1 text-xs text-accent-red">{{ errors.name }}</p>
              </div>
              <div>
                <label class="label">Email</label>
                <input v-model="form.email" class="input" :class="errors.email && '!border-accent-red'" />
                <p v-if="errors.email" class="mt-1 text-xs text-accent-red">{{ errors.email }}</p>
              </div>
            </div>
            <div>
              <label class="label">Address</label>
              <input v-model="form.address" class="input" :class="errors.address && '!border-accent-red'" />
              <p v-if="errors.address" class="mt-1 text-xs text-accent-red">{{ errors.address }}</p>
            </div>
            <div class="grid gap-4 sm:grid-cols-3">
              <div>
                <label class="label">City</label>
                <input v-model="form.city" class="input" :class="errors.city && '!border-accent-red'" />
                <p v-if="errors.city" class="mt-1 text-xs text-accent-red">{{ errors.city }}</p>
              </div>
              <div>
                <label class="label">Country</label>
                <input v-model="form.country" class="input" :class="errors.country && '!border-accent-red'" />
                <p v-if="errors.country" class="mt-1 text-xs text-accent-red">{{ errors.country }}</p>
              </div>
              <div>
                <label class="label">Zip</label>
                <input v-model="form.zip" class="input" :class="errors.zip && '!border-accent-red'" />
                <p v-if="errors.zip" class="mt-1 text-xs text-accent-red">{{ errors.zip }}</p>
              </div>
            </div>

            <div class="flex justify-between pt-4">
              <RouterLink to="/cart" class="btn-ghost">← Back to cart</RouterLink>
              <button class="btn-primary !py-3" @click="next">Continue to payment →</button>
            </div>
          </div>

          <!-- Step 2 -->
          <div v-else-if="step === 2" key="ship" class="space-y-6">
            <div>
              <h2 class="font-display text-2xl text-white">Shipping method</h2>
              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                <label
                  v-for="opt in [{ id: 'standard', name: 'Standard', price: '$4.99', desc: '3–5 business days' }, { id: 'express', name: 'Express', price: '$9.99', desc: '24–48 hours' }]"
                  :key="opt.id"
                  class="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition"
                  :class="form.shipping === opt.id ? 'border-rip-400 bg-rip-500/10' : 'border-white/10 hover:border-white/20'"
                >
                  <input type="radio" v-model="form.shipping" :value="opt.id" class="accent-rip-500" />
                  <div>
                    <p class="font-display text-lg text-white">{{ opt.name }}</p>
                    <p class="text-xs text-slate-400">{{ opt.desc }}</p>
                  </div>
                  <span class="ml-auto font-semibold text-white">{{ opt.price }}</span>
                </label>
              </div>
            </div>

            <div>
              <h2 class="font-display text-2xl text-white">Payment</h2>
              <div class="mt-3 grid gap-2 sm:grid-cols-3">
                <button v-for="m in [{ id: 'card', label: '💳 Card' }, { id: 'paypal', label: '🅿 PayPal' }, { id: 'transfer', label: '🏦 Transfer' }]"
                  :key="m.id"
                  class="rounded-xl border px-3 py-3 text-sm font-semibold transition"
                  :class="form.payment === m.id ? 'border-rip-400 bg-rip-500/10 text-white' : 'border-white/10 text-slate-300 hover:bg-white/5'"
                  @click="form.payment = m.id">
                  {{ m.label }}
                </button>
              </div>

              <div v-if="form.payment === 'card'" class="mt-4 grid gap-4 sm:grid-cols-3">
                <div class="sm:col-span-2">
                  <label class="label">Card number</label>
                  <input :value="form.card" @input="form.card = formatCard($event.target.value)" class="input" placeholder="0000 0000 0000 0000" :class="errors.card && '!border-accent-red'" />
                  <p v-if="errors.card" class="mt-1 text-xs text-accent-red">{{ errors.card }}</p>
                </div>
                <div>
                  <label class="label">Expiry</label>
                  <input :value="form.expiry" @input="form.expiry = formatExpiry($event.target.value)" class="input" placeholder="MM/YY" :class="errors.expiry && '!border-accent-red'" />
                  <p v-if="errors.expiry" class="mt-1 text-xs text-accent-red">{{ errors.expiry }}</p>
                </div>
                <div>
                  <label class="label">CVC</label>
                  <input v-model="form.cvc" maxlength="4" class="input" placeholder="123" :class="errors.cvc && '!border-accent-red'" />
                  <p v-if="errors.cvc" class="mt-1 text-xs text-accent-red">{{ errors.cvc }}</p>
                </div>
              </div>
              <p v-else-if="form.payment === 'paypal'" class="mt-4 text-sm text-slate-300">You will be redirected to PayPal after review.</p>
              <p v-else class="mt-4 text-sm text-slate-300">Bank details will be emailed after you place the order.</p>
            </div>

            <div class="flex justify-between pt-4">
              <button class="btn-ghost" @click="back">← Back</button>
              <button class="btn-primary !py-3" @click="next">Review order →</button>
            </div>
          </div>

          <!-- Step 3 -->
          <div v-else key="review" class="space-y-6">
            <h2 class="font-display text-2xl text-white">Review your order</h2>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl border border-white/10 p-4">
                <p class="text-xs uppercase tracking-widest text-slate-400">Ship to</p>
                <p class="mt-2 text-white">{{ form.name }}</p>
                <p class="text-sm text-slate-300">{{ form.address }}, {{ form.city }}</p>
                <p class="text-sm text-slate-300">{{ form.country }} · {{ form.zip }}</p>
              </div>
              <div class="rounded-2xl border border-white/10 p-4">
                <p class="text-xs uppercase tracking-widest text-slate-400">Payment</p>
                <p class="mt-2 text-white capitalize">{{ form.payment }}</p>
                <p v-if="form.payment === 'card'" class="text-sm text-slate-300">•••• {{ form.card.slice(-4) }}</p>
                <p class="mt-2 text-sm text-slate-300">Shipping: <span class="capitalize text-white">{{ form.shipping }}</span></p>
              </div>
            </div>
            <div class="space-y-3">
              <div v-for="i in detailed" :key="i.id" class="flex items-center gap-3 rounded-2xl border border-white/5 p-3">
                <div class="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl ring-stadium">
                  <img :src="i.images?.[0] || '/beyblades/hero.svg'" class="absolute inset-0 m-auto h-12 w-12 object-contain" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-white">{{ i.title }}</p>
                  <p class="text-xs text-slate-400">Qty: {{ i.quantity }}</p>
                </div>
                <p class="text-sm text-white">${{ (i.price * i.quantity).toFixed(2) }}</p>
              </div>
            </div>

            <div class="flex justify-between pt-2">
              <button class="btn-ghost" @click="back">← Back</button>
              <button class="btn-primary !py-3" :disabled="submitting" @click="placeOrder">
                <span v-if="submitting" class="flex items-center gap-2">
                  <span class="streak h-4 w-4 rounded-full animate-spin-slow"></span> Processing...
                </span>
                <span v-else>Place order · ${{ cart.total.toFixed(2) }}</span>
              </button>
            </div>
          </div>
        </transition>
      </RevealOnScroll>

      <aside class="card-surface sticky top-24 h-fit p-6">
        <h3 class="font-display text-2xl text-white">In your cart</h3>
        <ul class="mt-4 space-y-3">
          <li v-for="i in detailed" :key="i.id" class="flex items-center gap-3 text-sm">
            <div class="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl ring-stadium">
              <img :src="i.images?.[0] || '/beyblades/hero.svg'" class="absolute inset-0 m-auto h-10 w-10 object-contain" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="truncate font-semibold text-white">{{ i.title }}</p>
              <p class="text-xs text-slate-400">×{{ i.quantity }}</p>
            </div>
            <p class="text-white">${{ (i.price * i.quantity).toFixed(2) }}</p>
          </li>
        </ul>
        <div class="rip-divider my-4"></div>
        <dl class="space-y-1.5 text-sm">
          <div class="flex justify-between"><dt class="text-slate-400">Subtotal</dt><dd>${{ cart.subtotal.toFixed(2) }}</dd></div>
          <div class="flex justify-between"><dt class="text-slate-400">Shipping</dt><dd>{{ cart.shippingCost === 0 ? 'Free' : '$' + cart.shippingCost.toFixed(2) }}</dd></div>
          <div v-if="cart.discount" class="flex justify-between text-accent-green"><dt>Discount</dt><dd>−${{ cart.discount.toFixed(2) }}</dd></div>
        </dl>
        <div class="rip-divider my-3"></div>
        <div class="flex justify-between">
          <dt class="font-display text-lg text-white">Total</dt>
          <dd class="font-display text-2xl text-white">${{ cart.total.toFixed(2) }}</dd>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.step-enter-active,
.step-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.step-enter-from { opacity: 0; transform: translateX(20px); }
.step-leave-to { opacity: 0; transform: translateX(-20px); }
</style>
