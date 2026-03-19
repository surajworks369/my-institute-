/**
 * `authGuard.ts` (Router Guard)
 *
 * - **कशासाठी**: Protected routes वर जाण्यापूर्वी user login आहे का ते तपासण्यासाठी.
 * - **Project मधली role**: Vue Router navigation मध्ये auth based redirect handle करते.
 * - **Logic प्रकार**: localStorage मधील token → Pinia authStore sync + route `meta.requiresAuth` वर access control.
 * - **File प्रकार**: router (frontend)
 *
 * Note: सध्या auth state localStorage/token वर आधारलेली आहे; पुढे backend/API (session/JWT verify) आल्यावर
 * हा check server-side verify / refresh-token flow ने replace होऊ शकतो.
 */

// Router types (navigation guard signature साठी)
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
// Pinia auth store (login state आणि token sync करण्यासाठी)
import { useAuthStore } from '@/stores/authStore'

export function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  // प्रत्येक navigation वेळी auth state मिळवण्यासाठी store instance
  const authStore = useAuthStore()

  // Page reload नंतर store reset होऊ शकतो; म्हणून localStorage मधून token वाचून store मध्ये set करतो
  const token = localStorage.getItem('token')

  // localStorage मध्ये token आहे पण store मध्ये authenticated flag set नाहीये → storage वरून state restore
  if (token && !authStore.isAuthenticated) {
    authStore.setAuthFromStorage(token)
  }

  // `to.meta.requiresAuth` असलेला route = protected route
  // User unauthenticated असेल तर login page ला redirect; नाहीतर navigation continue
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
  } else {
    next()
  }
}