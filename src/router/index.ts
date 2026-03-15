import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { authGuard } from './authGuard'

// Layouts
import AuthLayout from '../layouts/AuthLayout.vue'
import MainLayout from '../layouts/MainLayout.vue'

// Auth Pages
import Login from '../views/auth/LoginPage.vue'
import Register from '../views/auth/RegisterPage.vue'

// Student Pages
import StudentList from '../views/students/StudentList.vue'
import AddStudent from '../views/students/AddStudent.vue'
import EditStudent from '../views/students/EditStudent.vue'
import ViewStudent from '../views/students/ViewStudent.vue'

// Course Pages
import CourseList from '../views/courses/CourseList.vue'
import AddCourse from '../views/courses/AddCourse.vue'
import EditCourse from '../views/courses/EditCourse.vue'
import ViewCourse from '../views/courses/ViewCourse.vue'

// Batch Pages
import BatchList from '../views/batches/BatchList.vue'
import AddBatch from '../views/batches/AddBatch.vue'
import EditBatch from '../views/batches/EditBatch.vue'
import ViewBatch from '../views/batches/ViewBatch.vue'

// Attendance Pages
import AttendanceList from '../views/attendance/AttendanceList.vue'
import AddAttendance from '../views/attendance/AddAttendance.vue'
import EditAttendance from '../views/attendance/EditAttendance.vue'
import ViewAttendance from '../views/attendance/ViewAttendance.vue'

// Exams Pages
import ExamList from '../views/exams/ExamList.vue'
import AddExam from '../views/exams/AddExam.vue'
import EditExam from '../views/exams/EditExam.vue'
import ViewExam from '../views/exams/ViewExam.vue'
import MarkEntry from '../views/exams/MarkEntry.vue'

// Fees Pages
import FeesList from '../views/fees/FeesList.vue'
import AddFee from '../views/fees/AddFee.vue'
import EditFee from '../views/fees/EditFee.vue'
import ViewFee from '../views/fees/ViewFee.vue'

// Reports Pages
import ReportsDashboard from '../views/reports/ReportsDashboard.vue'
import StudentReport from '../views/reports/StudentReport.vue'
import AttendanceReport from '../views/reports/AttendanceReport.vue'
import ExamReport from '../views/reports/ExamReport.vue'
import FeesReport from '../views/reports/FeesReport.vue'

// Staff Pages
import StaffList from '../views/staff/StaffList.vue'
import AddStaff from '../views/staff/AddStaff.vue'
import EditStaff from '../views/staff/EditStaff.vue'
import ViewStaff from '../views/staff/ViewStaff.vue'

// Settings Pages
import SettingsPage from '../views/settings/SettingsPage.vue'
import InstituteSettings from '../views/settings/InstituteSettings.vue'
import AcademicSettings from '../views/settings/AcademicSettings.vue'
import FeesSettings from '../views/settings/FeesSettings.vue'
import SystemSettings from '../views/settings/SystemSettings.vue'

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
    beforeEnter: authGuard,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/DashboardPage.vue'),
        meta: { requiresAuth: true, title: 'Dashboard' },
      },

      // Students
      {
        path: 'students',
        name: 'StudentList',
        component: StudentList,
        meta: { requiresAuth: true, title: 'Students' },
      },
      {
        path: 'students/add',
        name: 'AddStudent',
        component: AddStudent,
        meta: { requiresAuth: true, title: 'Add Student' },
      },
      {
        path: 'students/edit/:id',
        name: 'EditStudent',
        component: EditStudent,
        meta: { requiresAuth: true, title: 'Edit Student' },
      },
      {
        path: 'students/view/:id',
        name: 'ViewStudent',
        component: ViewStudent,
        meta: { requiresAuth: true, title: 'Student Details' },
      },

      // Courses
      {
        path: 'courses',
        name: 'CourseList',
        component: CourseList,
        meta: { requiresAuth: true, title: 'Courses' },
      },
      {
        path: 'courses/add',
        name: 'AddCourse',
        component: AddCourse,
        meta: { requiresAuth: true, title: 'Add Course' },
      },
      {
        path: 'courses/edit/:id',
        name: 'EditCourse',
        component: EditCourse,
        meta: { requiresAuth: true, title: 'Edit Course' },
      },
      {
        path: 'courses/view/:id',
        name: 'ViewCourse',
        component: ViewCourse,
        meta: { requiresAuth: true, title: 'Course Details' },
      },

      // Batches
      {
        path: 'batches',
        name: 'BatchList',
        component: BatchList,
        meta: { requiresAuth: true, title: 'Batches' },
      },
      {
        path: 'batches/add',
        name: 'AddBatch',
        component: AddBatch,
        meta: { requiresAuth: true, title: 'Add Batch' },
      },
      {
        path: 'batches/edit/:id',
        name: 'EditBatch',
        component: EditBatch,
        meta: { requiresAuth: true, title: 'Edit Batch' },
      },
      {
        path: 'batches/view/:id',
        name: 'ViewBatch',
        component: ViewBatch,
        meta: { requiresAuth: true, title: 'Batch Details' },
      },

      // Attendance
      {
        path: 'attendance',
        name: 'AttendanceList',
        component: AttendanceList,
        meta: { requiresAuth: true, title: 'Attendance' },
      },
      {
        path: 'attendance/add',
        name: 'AddAttendance',
        component: AddAttendance,
        meta: { requiresAuth: true, title: 'Mark Attendance' },
      },
      {
        path: 'attendance/edit/:id',
        name: 'EditAttendance',
        component: EditAttendance,
        meta: { requiresAuth: true, title: 'Edit Attendance' },
      },
      {
        path: 'attendance/view/:id',
        name: 'ViewAttendance',
        component: ViewAttendance,
        meta: { requiresAuth: true, title: 'Attendance Details' },
      },

      // Exams
      {
        path: 'exams',
        name: 'ExamList',
        component: ExamList,
        meta: { requiresAuth: true, title: 'Exams' },
      },
      {
        path: 'exams/add',
        name: 'AddExam',
        component: AddExam,
        meta: { requiresAuth: true, title: 'Add Exam' },
      },
      {
        path: 'exams/edit/:id',
        name: 'EditExam',
        component: EditExam,
        meta: { requiresAuth: true, title: 'Edit Exam' },
      },
      {
        path: 'exams/view/:id',
        name: 'ViewExam',
        component: ViewExam,
        meta: { requiresAuth: true, title: 'Exam Details' },
      },
      {
        path: 'exams/marks/add',
        name: 'AddExamMark',
        component: MarkEntry,
        meta: { requiresAuth: true, title: 'Add Marks' },
      },
      {
        path: 'exams/marks/edit/:id',
        name: 'EditExamMark',
        component: MarkEntry,
        meta: { requiresAuth: true, title: 'Edit Marks' },
      },

      // Fees
      {
        path: 'fees',
        name: 'FeesList',
        component: FeesList,
        meta: { requiresAuth: true, title: 'Fees' },
      },
      {
        path: 'fees/add',
        name: 'AddFee',
        component: AddFee,
        meta: { requiresAuth: true, title: 'Add Fee' },
      },
      {
        path: 'fees/edit/:id',
        name: 'EditFee',
        component: EditFee,
        meta: { requiresAuth: true, title: 'Edit Fee' },
      },
      {
        path: 'fees/view/:id',
        name: 'ViewFee',
        component: ViewFee,
        meta: { requiresAuth: true, title: 'Fee Details' },
      },

      // Reports
      {
        path: 'reports',
        name: 'ReportsDashboard',
        component: ReportsDashboard,
        meta: { requiresAuth: true, title: 'Reports Dashboard' },
      },
      {
        path: 'reports/students',
        name: 'StudentReport',
        component: StudentReport,
        meta: { requiresAuth: true, title: 'Student Report' },
      },
      {
        path: 'reports/attendance',
        name: 'AttendanceReport',
        component: AttendanceReport,
        meta: { requiresAuth: true, title: 'Attendance Report' },
      },
      {
        path: 'reports/exams',
        name: 'ExamReport',
        component: ExamReport,
        meta: { requiresAuth: true, title: 'Exam Report' },
      },
      {
        path: 'reports/fees',
        name: 'FeesReport',
        component: FeesReport,
        meta: { requiresAuth: true, title: 'Fees Report' },
      },

      // Staff
      {
        path: 'staff',
        name: 'StaffList',
        component: StaffList,
        meta: { requiresAuth: true, title: 'Staff' },
      },
      {
        path: 'staff/add',
        name: 'AddStaff',
        component: AddStaff,
        meta: { requiresAuth: true, title: 'Add Staff' },
      },
      {
        path: 'staff/edit/:id',
        name: 'EditStaff',
        component: EditStaff,
        meta: { requiresAuth: true, title: 'Edit Staff' },
      },
      {
        path: 'staff/view/:id',
        name: 'ViewStaff',
        component: ViewStaff,
        meta: { requiresAuth: true, title: 'Staff Details' },
      },

      // Settings
      {
        path: 'settings',
        name: 'SettingsPage',
        component: SettingsPage,
        meta: { requiresAuth: true, title: 'Settings' },
      },
      {
        path: 'settings/institute',
        name: 'InstituteSettings',
        component: InstituteSettings,
        meta: { requiresAuth: true, title: 'Institute Settings' },
      },
      {
        path: 'settings/academic',
        name: 'AcademicSettings',
        component: AcademicSettings,
        meta: { requiresAuth: true, title: 'Academic Settings' },
      },
      {
        path: 'settings/fees',
        name: 'FeesSettings',
        component: FeesSettings,
        meta: { requiresAuth: true, title: 'Fees Settings' },
      },
      {
        path: 'settings/system',
        name: 'SystemSettings',
        component: SystemSettings,
        meta: { requiresAuth: true, title: 'System Settings' },
      },
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

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : 'Vastu Bhandar ERP'
  document.title = pageTitle
})

export default router
