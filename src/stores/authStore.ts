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
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    users: [],
    currentUser: null,
  }),

  actions: {
    initialize() {
      const savedUser = localStorage.getItem('currentUser')

      if (savedUser) {
        this.currentUser = JSON.parse(savedUser)
        this.isAuthenticated = true
      }
    },

    register(user: User) {
      this.users.push(user)
      this.currentUser = user
      this.isAuthenticated = true

      localStorage.setItem('currentUser', JSON.stringify(user))
    },

    login(email: string, password: string): boolean {
      const foundUser = this.users.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        this.currentUser = foundUser
        this.isAuthenticated = true
        localStorage.setItem('currentUser', JSON.stringify(foundUser))
        return true
      }

      return false
    },

    logout() {
      this.currentUser = null
      this.isAuthenticated = false
      localStorage.removeItem('currentUser')
    },
  },
})
