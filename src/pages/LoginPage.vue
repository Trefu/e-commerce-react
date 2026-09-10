<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const error = ref('')

function login() {
  const result = auth.login(form)
  if (!result.ok) {
    error.value = result.error
    return
  }
  ui.toast({ title: 'Welcome back', content: auth.user.name, color: 'green' })
  const next = route.query.redirect || '/'
  router.push(next)
}
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
    <div class="card-surface relative overflow-hidden p-8">
      <div class="streak absolute -right-12 -top-12 h-48 w-48 opacity-30"></div>
      <p class="chip">Account</p>
      <h1 class="mt-2 font-display text-4xl text-white">Sign in</h1>
      <p class="mt-2 text-sm text-slate-400">Pick up your collection where you left it.</p>

      <form class="mt-8 space-y-4" @submit.prevent="login">
        <div>
          <label class="label">Email</label>
          <input v-model="form.email" type="email" class="input" required />
        </div>
        <div>
          <label class="label">Password</label>
          <input v-model="form.password" type="password" class="input" required minlength="4" />
        </div>
        <p v-if="error" class="text-xs text-accent-red">{{ error }}</p>
        <button type="submit" class="btn-primary w-full !py-3">Sign in</button>
      </form>

      <div class="my-6 flex items-center gap-3 text-xs text-slate-500">
        <div class="h-px flex-1 bg-white/10"></div>
        OR
        <div class="h-px flex-1 bg-white/10"></div>
      </div>

      <div class="space-y-2">
        <button class="btn-secondary w-full !py-3">Continue with Google</button>
        <button class="btn-secondary w-full !py-3">Continue with Apple</button>
      </div>

      <p class="mt-6 text-center text-sm text-slate-400">
        New here? <RouterLink to="/signup" class="text-rip-200 hover:text-white">Create an account</RouterLink>
      </p>
      <p class="mt-2 text-center text-xs text-slate-500">Demo credentials · <code class="rounded bg-white/10 px-1">demo@letitrip.test</code> / <code class="rounded bg-white/10 px-1">demo1234</code></p>
    </div>
  </div>
</template>
