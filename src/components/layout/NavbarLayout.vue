<template>
  <header class="navbar">
    <!-- LEFT SIDE -->
    <div class="left-section">
      <div class="breadcrumb">
        <span class="page-kicker">Institute ERP</span>
        <h1 class="page-title">{{ pageTitle }}</h1>
      </div>

      <div class="search-box">
        <input
          v-model.trim="searchQuery"
          type="text"
          placeholder="Search dashboard, students, staff, fees..."
          @keydown.enter="handleSearch"
        />
        <button class="search-icon-btn" type="button" @click="handleSearch" title="Search">
          🔍
        </button>
      </div>
    </div>

    <!-- RIGHT SIDE -->
    <div class="right-section">
      <!-- Notifications -->
      <div class="dropdown-wrapper" ref="notificationRef">
        <button class="icon-box" type="button" @click="toggleNotification">
          🔔
          <span class="badge">3</span>
        </button>

        <div v-if="notificationOpen" class="dropdown notification">
          <div class="dropdown-title">Notifications</div>
          <div class="dropdown-item">New Admission Added</div>
          <div class="dropdown-item">Fee Payment Received</div>
          <div class="dropdown-item">Exam Schedule Updated</div>
        </div>
      </div>

      <!-- User Profile -->
      <div class="dropdown-wrapper" ref="profileRef">
        <button class="user-box" type="button" @click="toggleDropdown">
          <span class="user-icon">👤</span>
          <span>{{ auth.currentUser?.name || 'Admin' }}</span>
        </button>

        <div v-if="dropdownOpen" class="dropdown profile-dropdown">
          <div class="dropdown-item">My Profile</div>
          <div class="dropdown-item">Settings</div>
          <div class="dropdown-item logout" @click="logout">Logout</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const dropdownOpen = ref(false)
const notificationOpen = ref(false)
const searchQuery = ref('')

const notificationRef = ref<HTMLElement | null>(null)
const profileRef = ref<HTMLElement | null>(null)

const pageTitle = computed(() => {
  return (route.meta.title as string) || 'Dashboard'
})

const logout = () => {
  auth.logout()
  router.push('/auth/login')
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
  notificationOpen.value = false
}

const toggleNotification = () => {
  notificationOpen.value = !notificationOpen.value
  dropdownOpen.value = false
}

const searchRoutes: Record<string, string> = {
  dashboard: '/dashboard',

  student: '/students',
  students: '/students',
  addstudent: '/students/add',
  'add student': '/students/add',

  course: '/courses',
  courses: '/courses',
  addcourse: '/courses/add',
  'add course': '/courses/add',

  batch: '/batches',
  batches: '/batches',
  addbatch: '/batches/add',
  'add batch': '/batches/add',

  attendance: '/attendance',
  markattendance: '/attendance/add',
  'mark attendance': '/attendance/add',

  exam: '/exams',
  exams: '/exams',
  marks: '/exams/marks/add',
  'add marks': '/exams/marks/add',

  fee: '/fees',
  fees: '/fees',
  addfee: '/fees/add',
  'add fee': '/fees/add',

  report: '/reports',
  reports: '/reports',
  'student report': '/reports/students',
  'attendance report': '/reports/attendance',
  'exam report': '/reports/exams',
  'fees report': '/reports/fees',

  staff: '/staff',
  addstaff: '/staff/add',
  'add staff': '/staff/add',

  settings: '/settings',
  institute: '/settings/institute',
  academic: '/settings/academic',
  system: '/settings/system',
}

const handleSearch = () => {
  const query = searchQuery.value.toLowerCase().trim()

  if (!query) return

  const exactRoute = searchRoutes[query]
  if (exactRoute) {
    router.push(exactRoute)
    searchQuery.value = ''
    return
  }

  const matchedKey = Object.keys(searchRoutes).find((key) => key.includes(query))

  if (matchedKey) {
    const matchedRoute = searchRoutes[matchedKey]
    if (matchedRoute) {
      router.push(matchedRoute)
      searchQuery.value = ''
      return
    }
  }

  alert(`No result found for "${searchQuery.value}"`)
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  if (notificationRef.value && !notificationRef.value.contains(target)) {
    notificationOpen.value = false
  }

  if (profileRef.value && !profileRef.value.contains(target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => route.fullPath,
  () => {
    dropdownOpen.value = false
    notificationOpen.value = false
  },
)
</script>

<style scoped>
.navbar {
  height: 78px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.92));
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: relative;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(14px);
  transition: all 0.3s ease;
  z-index: 20;
}

:global(.dark) .navbar {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.94));
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
}

.left-section {
  display: flex;
  align-items: center;
  gap: 24px;
  min-width: 0;
}

.breadcrumb {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 180px;
}

.page-kicker {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #6366f1;
}

:global(.dark) .page-kicker {
  color: #93c5fd;
}

.page-title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
  background: linear-gradient(135deg, #0f172a, #2563eb, #7c3aed);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

:global(.dark) .page-title {
  background: linear-gradient(135deg, #f8fafc, #93c5fd, #c084fc);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  padding: 12px 46px 12px 16px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  width: 320px;
  background: rgba(255, 255, 255, 0.88);
  color: #0f172a;
  transition: all 0.3s ease;
  font-size: 14px;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03);
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

:global(.dark) .search-box input {
  background: rgba(30, 41, 59, 0.96);
  color: #f8fafc;
  border: 1px solid rgba(100, 116, 139, 0.5);
}

.search-icon-btn {
  position: absolute;
  right: 6px;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
}

.search-icon-btn:hover {
  transform: scale(1.05);
}

.right-section {
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
}

.dropdown-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.icon-box {
  position: relative;
  cursor: pointer;
  font-size: 18px;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.08);
  color: #1e293b;
  transition: all 0.25s ease;
  border: none;
}

.icon-box:hover {
  transform: translateY(-2px);
  background: rgba(99, 102, 241, 0.16);
}

:global(.dark) .icon-box {
  background: rgba(148, 163, 184, 0.12);
  color: #f8fafc;
}

:global(.dark) .icon-box:hover {
  background: rgba(148, 163, 184, 0.2);
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-box {
  cursor: pointer;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 14px;
  transition: all 0.25s ease;
  background: rgba(99, 102, 241, 0.08);
  border: none;
}

.user-box:hover {
  background: rgba(99, 102, 241, 0.15);
}

.user-icon {
  font-size: 18px;
}

:global(.dark) .user-box {
  color: #f8fafc;
  background: rgba(148, 163, 184, 0.12);
}

:global(.dark) .user-box:hover {
  background: rgba(148, 163, 184, 0.2);
}

.dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 18px;
  width: 220px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.16);
  padding: 10px 0;
  z-index: 200;
  border: 1px solid rgba(148, 163, 184, 0.16);
  animation: fadeIn 0.2s ease-in-out;
  backdrop-filter: blur(16px);
}

:global(.dark) .dropdown {
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(100, 116, 139, 0.2);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.notification {
  width: 260px;
}

.dropdown-title {
  font-weight: 800;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  color: #0f172a;
}

:global(.dark) .dropdown-title {
  color: #f8fafc;
  border-bottom: 1px solid rgba(100, 116, 139, 0.22);
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  color: #334155;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  color: white;
}

:global(.dark) .dropdown-item {
  color: #cbd5e1;
}

.logout {
  color: #ef4444;
  font-weight: 700;
}

.logout:hover {
  color: white;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1100px) {
  .navbar {
    padding: 14px 18px;
    height: auto;
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .left-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    width: 100%;
  }

  .right-section {
    justify-content: flex-end;
  }
}

@media (max-width: 700px) {
  .page-title {
    font-size: 24px;
  }
  .user-box span:last-child {
    display: none;
  }
}
</style>
