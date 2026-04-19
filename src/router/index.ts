/**
 * router/index.ts
 *
 * Responsibilities:
 * - Define all application routes
 * - Separate public vs protected pages
 * - Run login checks
 * - Update the document title per route
 */

import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Layouts
import AuthLayout from '../layouts/AuthLayout.vue'
import MainLayout from '../layouts/MainLayout.vue'

// Auth Pages
import Login from '../views/auth/LoginPage.vue'
import Register from '../views/auth/RegisterPage.vue'

const routes: RouteRecordRaw[] = [
  // =========================
  // Public Routes
  // =========================
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

  // =========================
  // Protected Routes
  // =========================
  {
    path: '/',
    component: MainLayout,
    children: [
      // Dashboard
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardPage.vue'),
        meta: { requiresAuth: true, title: 'Dashboard' },
      },

      // =========================
      // Students
      // =========================
      {
        path: 'students',
        name: 'Students',
        component: () => import('../views/students/StudentList.vue'),
        meta: { requiresAuth: true, title: 'Students' },
      },
      {
        path: 'students/add',
        name: 'AddStudent',
        component: () => import('../views/students/AddStudent.vue'),
        meta: { requiresAuth: true, title: 'Add Student' },
      },
      {
        path: 'students/edit/:id',
        name: 'EditStudent',
        component: () => import('../views/students/EditStudent.vue'),
        meta: { requiresAuth: true, title: 'Edit Student' },
      },
      {
        path: 'students/view/:id',
        name: 'ViewStudent',
        component: () => import('../views/students/ViewStudent.vue'),
        meta: { requiresAuth: true, title: 'View Student' },
      },

      // =========================
      // Courses
      // =========================
      {
        path: 'courses',
        name: 'Courses',
        component: () => import('../views/courses/CourseList.vue'),
        meta: { requiresAuth: true, title: 'Courses' },
      },
      {
        path: 'courses/add',
        name: 'AddCourse',
        component: () => import('../views/courses/AddCourse.vue'),
        meta: { requiresAuth: true, title: 'Add Course' },
      },
      {
        path: 'courses/edit/:id',
        name: 'EditCourse',
        component: () => import('../views/courses/EditCourse.vue'),
        meta: { requiresAuth: true, title: 'Edit Course' },
      },
      {
        path: 'courses/view/:id',
        name: 'ViewCourse',
        component: () => import('../views/courses/ViewCourse.vue'),
        meta: { requiresAuth: true, title: 'View Course' },
      },

      // =========================
      // Batches
      // =========================
      {
        path: 'batches',
        name: 'Batches',
        component: () => import('../views/batches/BatchList.vue'),
        meta: { requiresAuth: true, title: 'Batches' },
      },
      {
        path: 'batches/add',
        name: 'AddBatch',
        component: () => import('../views/batches/AddBatch.vue'),
        meta: { requiresAuth: true, title: 'Add Batch' },
      },
      {
        path: 'batches/edit/:id',
        name: 'EditBatch',
        component: () => import('../views/batches/EditBatch.vue'),
        meta: { requiresAuth: true, title: 'Edit Batch' },
      },
      {
        path: 'batches/view/:id',
        name: 'ViewBatch',
        component: () => import('../views/batches/ViewBatch.vue'),
        meta: { requiresAuth: true, title: 'View Batch' },
      },

      // =========================
      // Attendance
      // =========================
      {
        path: 'attendance',
        name: 'Attendance',
        component: () => import('../views/attendance/AttendanceList.vue'),
        meta: { requiresAuth: true, title: 'Attendance' },
      },
      {
        path: 'attendance/add',
        name: 'AddAttendance',
        component: () => import('../views/attendance/AddAttendance.vue'),
        meta: { requiresAuth: true, title: 'Add Attendance' },
      },
      {
        path: 'attendance/edit/:id',
        name: 'EditAttendance',
        component: () => import('../views/attendance/EditAttendance.vue'),
        meta: { requiresAuth: true, title: 'Edit Attendance' },
      },
      {
        path: 'attendance/view/:id',
        name: 'ViewAttendance',
        component: () => import('../views/attendance/ViewAttendance.vue'),
        meta: { requiresAuth: true, title: 'View Attendance' },
      },

      // =========================
      // Exams
      // =========================
      {
        path: 'exams',
        name: 'Exams',
        component: () => import('../views/exams/ExamList.vue'),
        meta: { requiresAuth: true, title: 'Exams' },
      },
      {
        path: 'exams/add',
        name: 'AddExam',
        component: () => import('../views/exams/AddExam.vue'),
        meta: { requiresAuth: true, title: 'Add Exam' },
      },
      {
        path: 'exams/edit/:id',
        name: 'EditExam',
        component: () => import('../views/exams/EditExam.vue'),
        meta: { requiresAuth: true, title: 'Edit Exam' },
      },
      {
        path: 'exams/view/:id',
        name: 'ViewExam',
        component: () => import('../views/exams/ViewExam.vue'),
        meta: { requiresAuth: true, title: 'View Exam' },
      },

      // =========================
      // Fees
      // =========================
      {
        path: 'fees',
        name: 'Fees',
        component: () => import('../views/fees/FeesList.vue'),
        meta: { requiresAuth: true, title: 'Fees' },
      },
      {
        path: 'fees/add',
        name: 'AddFees',
        component: () => import('../views/fees/AddFees.vue'),
        meta: { requiresAuth: true, title: 'Add Fees' },
      },
      {
        path: 'fees/edit/:id',
        name: 'EditFees',
        component: () => import('../views/fees/EditFees.vue'),
        meta: { requiresAuth: true, title: 'Edit Fees' },
      },
      {
        path: 'fees/view/:id',
        name: 'ViewFees',
        component: () => import('../views/fees/ViewFees.vue'),
        meta: { requiresAuth: true, title: 'View Fees' },
      },

      // =========================
      // Reports
      // =========================
      {
        path: 'reports',
        name: 'Reports',
        component: () => import('../views/reports/ReportsPage.vue'),
        meta: { requiresAuth: true, title: 'Reports' },
      },
      {
        path: 'reports/students',
        name: 'StudentReport',
        component: () => import('../views/reports/StudentReport.vue'),
        meta: { requiresAuth: true, title: 'Student Report' },
      },
      {
        path: 'reports/attendance',
        name: 'AttendanceReport',
        component: () => import('../views/reports/AttendanceReport.vue'),
        meta: { requiresAuth: true, title: 'Attendance Report' },
      },
      {
        path: 'reports/exams',
        name: 'ExamReport',
        component: () => import('../views/reports/ExamReport.vue'),
        meta: { requiresAuth: true, title: 'Exam Report' },
      },
      {
        path: 'reports/fees',
        name: 'FeesReport',
        component: () => import('../views/reports/FeesReport.vue'),
        meta: { requiresAuth: true, title: 'Fees Report' },
      },

      // =========================
      // Staff
      // =========================
      {
        path: 'staff',
        name: 'Staff',
        component: () => import('../views/staff/StaffList.vue'),
        meta: { requiresAuth: true, title: 'Staff' },
      },
      {
        path: 'staff/add',
        name: 'AddStaff',
        component: () => import('../views/staff/AddStaff.vue'),
        meta: { requiresAuth: true, title: 'Add Staff' },
      },
      {
        path: 'staff/edit/:id',
        name: 'EditStaff',
        component: () => import('../views/staff/EditStaff.vue'),
        meta: { requiresAuth: true, title: 'Edit Staff' },
      },
      {
        path: 'staff/view/:id',
        name: 'ViewStaff',
        component: () => import('../views/staff/ViewStaff.vue'),
        meta: { requiresAuth: true, title: 'View Staff' },
      },

      // =========================
      // Settings
      // =========================
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/settings/SettingsPage.vue'),
        meta: { requiresAuth: true, title: 'Settings' },
      },
    ],
  },

  // =========================
  // Not Found
  // =========================
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

  // Rehydrate auth from localStorage after reload
  authStore.initialize()

  // Protected route without login — send user to login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/auth/login')
    return
  }

  // Logged-in user hitting login/register again — redirect to dashboard
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
