import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Layouts
import AuthLayout from '../layouts/AuthLayout.vue'
import MainLayout from '../layouts/MainLayout.vue'

// Auth Pages
import Login from '../views/auth/LoginPage.vue'
import Register from '../views/auth/RegisterPage.vue'

// तुमचे बाकी सर्व existing imports इथे तसेच ठेवा
// Students, Courses, Batches, Attendance, Exams, Fees, Reports, Staff, Settings...

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/landing/LandingPage.vue'),
    meta: { title: 'Vastu Bhandar ERP' },
  },

  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login,
        meta: { title: 'Login' },
      },
      {
        path: 'register',
        name: 'Register',
        component: Register,
        meta: { title: 'Register' },
      },
    ],
  },

  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardPage.vue'),
        meta: { requiresAuth: true, title: 'Dashboard' },
      },

      // तुमचे बाकी existing protected routes इथे तसेच ठेवा
      // students, courses, batches, attendance, exams, fees, reports, staff, settings...
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: 'Page Not Found' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, left: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  authStore.initialize()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
    return
  }

  if (authStore.isAuthenticated && (to.path === '/auth/login' || to.path === '/auth/register')) {
    next('/dashboard')
    return
  }

  next()
})

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : 'Vastu Bhandar ERP'
  document.title = pageTitle
})

export default router
