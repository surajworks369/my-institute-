/**
 * `services/authService.ts` (Auth Service - localStorage demo)
 *
 * - **Purpose**: Auth helpers (login/logout/getCurrentUser).
 * - **Role in project**: Optional data layer for auth UI/guards to read session from localStorage.
 * - **Logic type**: Save/remove/read user object in localStorage (dummy auth).
 * - **File type**: Service (frontend)
 *
 * Note: Demo flow with a dummy token. With a backend/API:
 * - Login becomes an API call
 * - Token/session verified or refreshed on the server
 * - Keep only minimal session data in localStorage
 */

import type { User } from '../types/user'

// localStorage key for logged-in session
const STORAGE_KEY = 'erp_user'

export function login(email: string, password: string): User | null {
  // Dummy login: succeeds when email and password are non-empty
  if (email && password) {
    const user: User = {
      id: '1',
      name: 'Admin User',
      email,
      role: 'admin',
      token: 'dummy-token',
    }

    // Persist session (available after reload via `getCurrentUser`)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    return user
  }

  return null
}

export function logout() {
  // Session clear
  localStorage.removeItem(STORAGE_KEY)
}

export function getCurrentUser(): User | null {
  // Session read
  const user = localStorage.getItem(STORAGE_KEY)
  return user ? JSON.parse(user) : null
}
