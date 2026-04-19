/**
 * `stores/authStore.ts` (Pinia Auth Store)
 *
 * - **Purpose**: Manage login/register/logout and session state (authenticated, user, token).
 * - **Role in project**: Supplies login status and current user to router guards and auth views.
 * - **Logic type**: In-memory state + localStorage persistence (restore after reload).
 * - **File type**: Store (frontend / Pinia)
 *
 * Note: Register/login currently simulate persistence in localStorage. With a backend/API:
 * - User list would come from an API/database instead of localStorage
 * - Token generation/validation would move to the server
 * - `initialize()` could call token verify/refresh endpoints
 */

import { defineStore } from 'pinia'

// User roles (for UI / permissions)
export type UserRole = 'admin' | 'staff' | 'student'

// User record shape used across the app
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
    // Restore state from localStorage on app start / route changes
    initialize() {
      const savedUser = localStorage.getItem('currentUser')
      const token = localStorage.getItem('token')
      const users = localStorage.getItem('users')

      // Restore stored user list (register/login demo)
      if (users) {
        this.users = JSON.parse(users)
      }

      // Restore session after reload when both token and currentUser exist
      if (savedUser && token) {
        this.currentUser = JSON.parse(savedUser)
        this.token = token
        this.isAuthenticated = true
      }
    },

    // Register a new user (localStorage demo for now; replace with API later)
    register(user: User) {
      this.users.push(user)
      this.currentUser = user
      this.isAuthenticated = true

      // Frontend-only token (demo). A real app would receive a token from the backend.
      this.token = 'token-' + Date.now()

      // Persist users + session for reload
      localStorage.setItem('users', JSON.stringify(this.users))
      localStorage.setItem('currentUser', JSON.stringify(user))
      localStorage.setItem('token', this.token)
    },

    // Login: match against stored users and set session
    login(email: string, password: string): boolean {
      const foundUser = this.users.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        this.currentUser = foundUser
        this.isAuthenticated = true

        // Frontend-only token (demo). Real app: backend verifies credentials and issues a token.
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

    // Used by router guard: hydrate store when a token exists in storage
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
