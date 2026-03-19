import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Layouts
import AuthLayout from '../layouts/AuthLayout.vue'
import MainLayout from '../layouts/MainLayout.vue'

// Auth Pages
import Login from '../views/auth/LoginPage.vue'
import Register from '../views/auth/RegisterPage.vue'

// बाकी imports same ठेव (तुझ्यासारखेच)

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

      // 👉 बाकी सगळे routes SAME ठेव (copy paste तुझ्यासारखेच)
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
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, left: 0, behavior: 'smooth' }
  },
})

/* 🔥🔥🔥 MAIN FIX HERE 🔥🔥🔥 */
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 👉 reload नंतर state restore
  authStore.initialize()

  // 👉 जर login नसताना protected page
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
  }

  // 👉 जर already login असून login page ला गेला
  else if (
    authStore.isAuthenticated &&
    (to.path === '/auth/login' || to.path === '/auth/register')
  ) {
    next('/dashboard')
  } else {
    next()
  }
})

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : 'Vastu Bhandar ERP'
  document.title = pageTitle
})

export default router
