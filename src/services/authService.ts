import type { User } from '../types/user'

const STORAGE_KEY = 'erp_user'

export function login(email: string, password: string): User | null {
  // Dummy login
  if (email && password) {
    const user: User = {
      id: '1',
      name: 'Admin User',
      email,
      role: 'admin',
      token: 'dummy-token',
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    return user
  }

  return null
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getCurrentUser(): User | null {
  const user = localStorage.getItem(STORAGE_KEY)
  return user ? JSON.parse(user) : null
}
