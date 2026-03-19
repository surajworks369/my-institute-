<template>
  <aside :class="['sidebar', { collapsed, 'mobile-open': mobileOpen, 'mobile-mode': isMobile }]">
    <div class="sidebar-header">
      <div v-if="!collapsed || isMobile" class="title-wrap">
        <h2 class="title">
          <span>Admin</span>
          <span>Panel</span>
        </h2>
      </div>

      <div class="header-actions">
        <button
          v-if="!isMobile"
          class="toggle-btn"
          type="button"
          @click="toggleSidebar"
          :title="collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
        >
          {{ collapsed ? '➡' : '⬅' }}
        </button>

        <button
          v-if="isMobile"
          class="toggle-btn"
          type="button"
          @click="emitCloseMobile"
          title="Close Sidebar"
        >
          ✕
        </button>
      </div>
    </div>

    <div class="sidebar-menu-scroll">
      <nav class="menu">
        <RouterLink
          to="/dashboard"
          class="menu-item"
          active-class="active"
          :title="collapsed && !isMobile ? 'Dashboard' : ''"
          @click="handleMenuClick"
        >
          <span class="icon">🏠</span>
          <span v-if="!collapsed || isMobile" class="label">Dashboard</span>
        </RouterLink>

        <div v-if="isAcademicVisible" class="menu-group">
          <div
            class="menu-title"
            @click="toggleGroup('academic')"
            :title="collapsed && !isMobile ? 'Academic' : ''"
          >
            <div class="menu-title-left">
              <span class="icon">🎓</span>
              <span v-if="!collapsed || isMobile" class="label">Academic</span>
            </div>

            <span
              v-if="!collapsed || isMobile"
              class="arrow"
              :class="{ open: openGroups.academic }"
            >
              ⌄
            </span>
          </div>

          <transition name="slide">
            <div v-show="openGroups.academic && (!collapsed || isMobile)" class="submenu">
              <RouterLink
                to="/students"
                class="submenu-item"
                active-class="active"
                @click="handleMenuClick"
              >
                <span class="label">Students</span>
              </RouterLink>

              <RouterLink
                to="/courses"
                class="submenu-item"
                active-class="active"
                @click="handleMenuClick"
              >
                <span class="label">Courses</span>
              </RouterLink>

              <RouterLink
                to="/batches"
                class="submenu-item"
                active-class="active"
                @click="handleMenuClick"
              >
                <span class="label">Batches</span>
              </RouterLink>

              <RouterLink
                to="/attendance"
                class="submenu-item"
                active-class="active"
                @click="handleMenuClick"
              >
                <span class="label">Attendance</span>
              </RouterLink>

              <RouterLink
                to="/exams"
                class="submenu-item"
                active-class="active"
                @click="handleMenuClick"
              >
                <span class="label">Exams</span>
              </RouterLink>
            </div>
          </transition>
        </div>

        <div v-if="isFinanceVisible" class="menu-group">
          <div
            class="menu-title"
            @click="toggleGroup('finance')"
            :title="collapsed && !isMobile ? 'Finance' : ''"
          >
            <div class="menu-title-left">
              <span class="icon">💰</span>
              <span v-if="!collapsed || isMobile" class="label">Finance</span>
            </div>

            <span v-if="!collapsed || isMobile" class="arrow" :class="{ open: openGroups.finance }">
              ⌄
            </span>
          </div>

          <transition name="slide">
            <div v-show="openGroups.finance && (!collapsed || isMobile)" class="submenu">
              <RouterLink
                to="/fees"
                class="submenu-item"
                active-class="active"
                @click="handleMenuClick"
              >
                <span class="label">Fees</span>
              </RouterLink>

              <RouterLink
                to="/reports"
                class="submenu-item"
                active-class="active"
                @click="handleMenuClick"
              >
                <span class="label">Reports</span>
              </RouterLink>
            </div>
          </transition>
        </div>

        <div v-if="role === 'admin'" class="menu-group">
          <div
            class="menu-title"
            @click="toggleGroup('administration')"
            :title="collapsed && !isMobile ? 'Administration' : ''"
          >
            <div class="menu-title-left">
              <span class="icon">⚙️</span>
              <span v-if="!collapsed || isMobile" class="label">Administration</span>
            </div>

            <span
              v-if="!collapsed || isMobile"
              class="arrow"
              :class="{ open: openGroups.administration }"
            >
              ⌄
            </span>
          </div>

          <transition name="slide">
            <div v-show="openGroups.administration && (!collapsed || isMobile)" class="submenu">
              <RouterLink
                to="/staff"
                class="submenu-item"
                active-class="active"
                @click="handleMenuClick"
              >
                <span class="label">Staff</span>
              </RouterLink>

              <RouterLink
                to="/settings"
                class="submenu-item"
                active-class="active"
                @click="handleMenuClick"
              >
                <span class="label">Settings</span>
              </RouterLink>
            </div>
          </transition>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

type GroupKey = 'academic' | 'finance' | 'administration'

const { mobileOpen } = defineProps<{
  mobileOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close-mobile'): void
  (e: 'toggle-mobile'): void
}>()

const route = useRoute()

const collapsed = ref(false)
const role = ref<'admin' | 'staff' | 'finance'>('admin')
const isMobile = ref(false)

const isAcademicVisible = computed(() => role.value === 'admin' || role.value === 'staff')
const isFinanceVisible = computed(() => role.value === 'admin' || role.value === 'finance')

const openGroups = ref<Record<GroupKey, boolean>>({
  academic: true,
  finance: false,
  administration: false,
})

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 1024

  if (isMobile.value) {
    collapsed.value = false
  }
}

const toggleSidebar = () => {
  if (isMobile.value) return
  collapsed.value = !collapsed.value
}

const toggleGroup = (group: GroupKey) => {
  if (collapsed.value && !isMobile.value) return
  openGroups.value[group] = !openGroups.value[group]
}

const emitCloseMobile = () => {
  emit('close-mobile')
}

const handleMenuClick = () => {
  if (isMobile.value) {
    emit('close-mobile')
  }
}

watch(
  () => route.path,
  (path) => {
    if (
      path.startsWith('/students') ||
      path.startsWith('/courses') ||
      path.startsWith('/batches') ||
      path.startsWith('/attendance') ||
      path.startsWith('/exams')
    ) {
      openGroups.value.academic = true
    }

    if (path.startsWith('/fees') || path.startsWith('/reports')) {
      openGroups.value.finance = true
    }

    if (path.startsWith('/staff') || path.startsWith('/settings')) {
      openGroups.value.administration = true
    }
  },
  { immediate: true },
)

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 260px;
  max-width: 260px;
  flex: 0 0 260px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 30%),
    linear-gradient(180deg, #17253d 0%, #122033 48%, #0f172a 100%);
  color: white;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 14px 0 32px rgba(2, 6, 23, 0.22);
  transition:
    width 0.3s ease,
    min-width 0.3s ease,
    max-width 0.3s ease,
    flex-basis 0.3s ease,
    transform 0.3s ease;
  overflow: hidden;
  box-sizing: border-box;
  z-index: 90;
}

.sidebar.collapsed {
  width: 94px;
  min-width: 94px;
  max-width: 94px;
  flex: 0 0 94px;
}

.sidebar-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 18px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  align-items: center;
  padding: 18px 10px;
}

.title-wrap {
  min-width: 0;
  flex: 1;
}

.title {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  line-height: 1.05;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: #ffffff;
}

.title span:last-child {
  color: #dbeafe;
}

.toggle-btn {
  width: 44px;
  min-width: 44px;
  height: 44px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #3b82f6, #4f46e5);
  color: white;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.28);
  transition: all 0.25s ease;
}

.toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(79, 70, 229, 0.3);
}

.sidebar-menu-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 14px 12px 24px;
}

.sidebar-menu-scroll::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.32);
  border-radius: 999px;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-item,
.menu-title,
.submenu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #dbe4f0;
  border-radius: 16px;
  box-sizing: border-box;
  transition: all 0.25s ease;
  background: transparent;
}

.menu-item,
.menu-title {
  min-height: 48px;
  padding: 12px 14px;
}

.submenu-item {
  min-height: 42px;
  padding: 10px 14px;
}

.menu-item:hover,
.menu-title:hover,
.submenu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.menu-title {
  justify-content: space-between;
  cursor: pointer;
}

.menu-title-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.submenu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 18px;
  margin-top: 2px;
  margin-left: 12px;
  border-left: 1px solid rgba(148, 163, 184, 0.2);
}

.submenu-item {
  color: #c9d6e5;
  border-radius: 14px;
}

.active {
  background: linear-gradient(135deg, #3b82f6, #4f46e5) !important;
  color: white !important;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.22);
}

.icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 22px;
  text-align: center;
}

.label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  min-width: 0;
  font-size: 16px;
  font-weight: 500;
}

.arrow {
  font-size: 15px;
  color: #94a3b8;
  transition: transform 0.25s ease;
}

.arrow.open {
  transform: rotate(180deg);
  color: #ffffff;
}

.sidebar.collapsed .sidebar-menu-scroll {
  padding: 14px 10px 24px;
}

.sidebar.collapsed .menu {
  align-items: center;
}

.sidebar.collapsed .menu-item,
.sidebar.collapsed .menu-title {
  width: 100%;
  min-height: 50px;
  justify-content: center;
  padding: 12px 0;
  border-radius: 16px;
}

.sidebar.collapsed .menu-group {
  width: 100%;
  align-items: center;
}

.sidebar.collapsed .submenu {
  display: none;
}

.sidebar.collapsed .icon {
  width: auto;
  font-size: 20px;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 400px;
}

@media (max-width: 1024px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 280px;
    min-width: 280px;
    max-width: 280px;
    flex: none;
    transform: translateX(-100%);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .sidebar.collapsed {
    width: 280px;
    min-width: 280px;
    max-width: 280px;
  }
}
</style>
