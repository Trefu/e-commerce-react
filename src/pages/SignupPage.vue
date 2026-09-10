<script setup>
import { reactive, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()
const ui = useUiStore()
const router = useRouter()

const form = reactive({ name: '', email: '', password: '' })
const error = ref('')

function signup() {
  if (!form.name.trim() || !form.email.trim() || form.password.length < 4) {
    error.value = 'All fields are required (password ≥ 4 chars).'
    return
  }
  const result = auth.signup(form)
  if (!result.ok) {
    error.value = result.error
    return
  }
  ui.toast({ title: 'Welcome to the storm', content: auth.user.name, color: 'green' })
  router.push('/')
}
</script>

<template>
  <div class="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
    <div class="card-surface relative overflow-hidden p-8">
      <div class="streak absolute -left-12 -bottom-12 h-48 w-48 opacity-30"></div>
      <p class="chip">Account</p>
      <h1 class="mt-2 font-display text-4xl text-white">Create account</h1>
      <p class="mt-2 text-sm text-slate-400">Save your combos, track orders, climb the leaderboard.</p>

      <form class="mt-8 space-y-4" @submit.prevent="signup">
        <div>
          <label class="label">Name</label>
          <input v-model="form.name" class="input" required />
        </div>
        <div>
          <label class="label">Email</label>
          <input v-model="form.email" type="email" class="input" required />
        </div>
        <div>
          <label class="label">Password</label>
          <input v-model="form.password" type="password" class="input" required minlength="4" />
        </div>
        <p v-if="error" class="text-xs text-accent-red">{{ error }}</p>
        <button class="btn-primary w-full !py-3">Create account</button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-400">
        Already have an account? <RouterLink to="/login" class="text-rip-200 hover:text-white">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>
