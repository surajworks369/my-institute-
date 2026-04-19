/**
 * `authGuard.ts` (Router Guard)
 *
 * - **Purpose**: Check whether the user is logged in before entering protected routes.
 * - **Role in project**: Handles auth-based redirects during Vue Router navigation.
 * - **Logic type**: Sync token from localStorage to Pinia `authStore` + access control via route `meta.requiresAuth`.
 * - **File type**: Router (frontend)
 *
 * Note: Auth state is currently driven by localStorage/token. When a backend/API (session/JWT verify)
 * is added, this check can be replaced with server-side verification or a refresh-token flow.
 */

// Router types (navigation guard signature)
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
// Pinia auth store (login state and token sync)
import { useAuthStore } from '@/stores/authStore'

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  // Resolve auth state on each navigation
  const authStore = useAuthStore()

  // After reload the store may reset; read token from localStorage and hydrate the store
  const token = localStorage.getItem('token')

  // Token exists in localStorage but the store is not marked authenticated — restore from storage
  if (token && !authStore.isAuthenticated) {
    authStore.setAuthFromStorage(token)
  }

  // `to.meta.requiresAuth` marks a protected route
  // Redirect unauthenticated users to login; otherwise continue navigation
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
  } else {
    next()
  }
}