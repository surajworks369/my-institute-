/**
 * `services/authService.ts` (Auth Service - localStorage demo)
 *
 * - **कशासाठी**: login/logout/currentUser सारखी auth related helper functions provide करणे.
 * - **Project मधली role**: Auth UI/guards ला (जर वापरले गेले तर) user session localStorage मधून मिळवून देऊ शकते.
 * - **Logic प्रकार**: localStorage मध्ये user object save/remove/read (dummy auth).
 * - **File प्रकार**: service (frontend)
 *
 * Note: हा auth flow demo आहे (dummy-token). पुढे backend/API आल्यावर:
 * - login → API call
 * - token/session → backend verify/refresh
 * - localStorage मध्ये minimum session info ठेवणे
 */

import type { User } from '../types/user'

// localStorage key: logged-in user session साठी
const STORAGE_KEY = 'erp_user'

export function login(email: string, password: string): User | null {
  // Dummy login: फक्त email/password non-empty असल्यास success मानतो
  if (email && password) {
    const user: User = {
      id: '1',
      name: 'Admin User',
      email,
      role: 'admin',
      token: 'dummy-token',
    }

    // Session persist (reload नंतर `getCurrentUser` ने मिळेल)
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
