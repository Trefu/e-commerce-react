import { defineStore } from 'pinia'

const LS_KEY = 'let-it-rip:auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    users: []
  }),
  getters: {
    isAuthenticated: (state) => !!state.user
  },
  actions: {
    init() {
      const raw = localStorage.getItem(LS_KEY)
      if (!raw) {
        this.users = [{
          id: 'demo',
          name: 'Demo Blader',
          email: 'demo@letitrip.test',
          password: 'demo1234',
          joinedAt: new Date().toISOString()
        }]
        localStorage.setItem(LS_KEY, JSON.stringify({ user: null, users: this.users }))
        return
      }
      try {
        const parsed = JSON.parse(raw)
        this.user = parsed.user
        this.users = parsed.users || []
      } catch {}
    },
    persist() {
      localStorage.setItem(LS_KEY, JSON.stringify({ user: this.user, users: this.users }))
    },
    signup({ name, email, password }) {
      if (this.users.find(u => u.email === email)) {
        return { ok: false, error: 'Email already in use.' }
      }
      const user = {
        id: 'u_' + Math.random().toString(36).slice(2, 9),
        name,
        email,
        password,
        joinedAt: new Date().toISOString()
      }
      this.users.push(user)
      this.user = user
      this.persist()
      return { ok: true }
    },
    login({ email, password }) {
      const u = this.users.find(x => x.email === email && x.password === password)
      if (!u) return { ok: false, error: 'Invalid credentials.' }
      this.user = u
      this.persist()
      return { ok: true }
    },
    logout() {
      this.user = null
      this.persist()
    },
    updateProfile(updates) {
      if (!this.user) return
      const idx = this.users.findIndex(u => u.id === this.user.id)
      if (idx >= 0) {
        this.users[idx] = { ...this.users[idx], ...updates }
        this.user = this.users[idx]
        this.persist()
      }
    }
  }
})
