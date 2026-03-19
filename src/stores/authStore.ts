/**
 * `stores/authStore.ts` (Pinia Auth Store)
 *
 * - **कशासाठी**: Login/Register/Logout आणि user session state (authenticated/user/token) manage करणे.
 * - **Project मधली role**: Router guards + auth pages ला login status आणि current user माहिती provide करते.
 * - **Logic प्रकार**: In-memory state + localStorage persistence (reload नंतर restore).
 * - **File प्रकार**: store (frontend / Pinia)
 *
 * Note: सध्या register/login localStorage वर simulate केलेलं आहे. पुढे backend/API आल्यानंतर:
 * - users list localStorage ऐवजी API/database मधून येईल
 * - token generation/validation backend कडे जाईल
 * - `initialize()` मध्ये token verify/refresh call येऊ शकतो
 */

import { defineStore } from 'pinia'

// User role types (UI/permissions साठी उपयोग होऊ शकतो)
export type UserRole = 'admin' | 'staff' | 'student'

// App मध्ये वापरला जाणारा user data shape
export interface User {
  name: string
  email: string
  password: string
  role: UserRole
}

// Store state: auth flags + stored users + current session
interface AuthState {
  isAuthenticated: boolean
  users: User[]
  currentUser: User | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  // Initial state (fresh app load)
  state: (): AuthState => ({
    isAuthenticated: false,
    users: [],
    currentUser: null,
    token: null,
  }),

  actions: {
    // App start / route change वेळी localStorage मधून state restore करण्यासाठी
    initialize() {
      const savedUser = localStorage.getItem('currentUser')
      const token = localStorage.getItem('token')
      const users = localStorage.getItem('users')

      // Stored users list restore (register/login demo साठी)
      if (users) {
        this.users = JSON.parse(users)
      }

      // Reload नंतर login session restore (token + currentUser असल्यास authenticated true)
      if (savedUser && token) {
        this.currentUser = JSON.parse(savedUser)
        this.token = token
        this.isAuthenticated = true
      }
    },

    // नवीन user register करणे (सध्या localStorage demo; पुढे API call होऊ शकतो)
    register(user: User) {
      this.users.push(user)
      this.currentUser = user
      this.isAuthenticated = true

      // Frontend-side token generation (demo). Real app मध्ये backend token देईल.
      this.token = 'token-' + Date.now()

      // Persist: users + current session (reload नंतर restore साठी)
      localStorage.setItem('users', JSON.stringify(this.users))
      localStorage.setItem('currentUser', JSON.stringify(user))
      localStorage.setItem('token', this.token)
    },

    // Login attempt: stored users मधून match करून session set करतो
    login(email: string, password: string): boolean {
      const foundUser = this.users.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        this.currentUser = foundUser
        this.isAuthenticated = true

        // Frontend-side token generation (demo). Real app मध्ये backend verify करून token देईल.
        this.token = 'token-' + Date.now()

        // Persist: current session
        localStorage.setItem('currentUser', JSON.stringify(foundUser))
        localStorage.setItem('token', this.token)

        return true
      }

      return false
    },

    // Logout: memory + localStorage session clear
    logout() {
      this.currentUser = null
      this.isAuthenticated = false
      this.token = null

      localStorage.removeItem('currentUser')
      localStorage.removeItem('token')
    },

    // Router guard usage: token storage मधून आल्यावर store state restore करण्यासाठी helper
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
