import { defineStore } from 'pinia'

export type UserRole = 'admin' | 'staff' | 'student'

export interface User {
  name: string
  email: string
  password: string
  role: UserRole
}

interface AuthState {
  isAuthenticated: boolean
  users: User[]
  currentUser: User | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    users: [],
    currentUser: null,
    token: null,
  }),

  actions: {
    initialize() {
      const savedUser = localStorage.getItem('currentUser')
      const token = localStorage.getItem('token')
      const users = localStorage.getItem('users')

      // 🔥 users restore
      if (users) {
        this.users = JSON.parse(users)
      }

      // 🔥 login restore after reload
      if (savedUser && token) {
        this.currentUser = JSON.parse(savedUser)
        this.token = token
        this.isAuthenticated = true
      }
    },

    register(user: User) {
      this.users.push(user)
      this.currentUser = user
      this.isAuthenticated = true

      // 🔥 token generate
      this.token = 'token-' + Date.now()

      // 🔥 save everything
      localStorage.setItem('users', JSON.stringify(this.users))
      localStorage.setItem('currentUser', JSON.stringify(user))
      localStorage.setItem('token', this.token)
    },

    login(email: string, password: string): boolean {
      const foundUser = this.users.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        this.currentUser = foundUser
        this.isAuthenticated = true

        // 🔥 token generate
        this.token = 'token-' + Date.now()

        // 🔥 save
        localStorage.setItem('currentUser', JSON.stringify(foundUser))
        localStorage.setItem('token', this.token)

        return true
      }

      return false
    },

    logout() {
      this.currentUser = null
      this.isAuthenticated = false
      this.token = null

      localStorage.removeItem('currentUser')
      localStorage.removeItem('token')
    },

    // 🔥 THIS FIXES YOUR ERROR
    setAuthFromStorage(token: string) {
      const savedUser = localStorage.getItem('currentUser')

      if (token && savedUser) {
        this.token = token
        this.currentUser = JSON.parse(savedUser)
        this.isAuthenticated = true
      }
    },
  },
})
