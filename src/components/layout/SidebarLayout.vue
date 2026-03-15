<template>
  <aside :class="['sidebar', { collapsed }]">
    <!-- Header -->
    <div class="sidebar-header">
      <div v-if="!collapsed" class="title-wrap">
        <h2 class="title">
          <span>Admin</span>
          <span>Panel</span>
        </h2>
      </div>

      <button
        class="toggle-btn"
        type="button"
        @click="toggleSidebar"
        :title="collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
      >
        {{ collapsed ? '➡' : '⬅' }}
      </button>
    </div>

    <!-- Menu Scroll Area -->
    <div class="sidebar-menu-scroll">
      <nav class="menu">
        <!-- Dashboard -->
        <RouterLink
          to="/dashboard"
          class="menu-item"
          active-class="active"
          :title="collapsed ? 'Dashboard' : ''"
        >
          <span class="icon">🏠</span>
          <span v-if="!collapsed" class="label">Dashboard</span>
        </RouterLink>

        <!-- Academic -->
        <div v-if="isAcademicVisible" class="menu-group">
          <div
            class="menu-title"
            @click="toggleGroup('academic')"
            :title="collapsed ? 'Academic' : ''"
          >
            <div class="menu-title-left">
              <span class="icon">🎓</span>
              <span v-if="!collapsed" class="label">Academic</span>
            </div>

            <span v-if="!collapsed" class="arrow" :class="{ open: openGroups.academic }">⌄</span>
          </div>

          <transition name="slide">
            <div v-show="openGroups.academic && !collapsed" class="submenu">
              <RouterLink to="/students" class="submenu-item" active-class="active">
                <span class="label">Students</span>
              </RouterLink>

              <RouterLink to="/courses" class="submenu-item" active-class="active">
                <span class="label">Courses</span>
              </RouterLink>

              <RouterLink to="/batches" class="submenu-item" active-class="active">
                <span class="label">Batches</span>
              </RouterLink>

              <RouterLink to="/attendance" class="submenu-item" active-class="active">
                <span class="label">Attendance</span>
              </RouterLink>

              <RouterLink to="/exams" class="submenu-item" active-class="active">
                <span class="label">Exams</span>
              </RouterLink>
            </div>
          </transition>
        </div>

        <!-- Finance -->
        <div v-if="isFinanceVisible" class="menu-group">
          <div
            class="menu-title"
            @click="toggleGroup('finance')"
            :title="collapsed ? 'Finance' : ''"
          >
            <div class="menu-title-left">
              <span class="icon">💰</span>
              <span v-if="!collapsed" class="label">Finance</span>
            </div>

            <span v-if="!collapsed" class="arrow" :class="{ open: openGroups.finance }">⌄</span>
          </div>

          <transition name="slide">
            <div v-show="openGroups.finance && !collapsed" class="submenu">
              <RouterLink to="/fees" class="submenu-item" active-class="active">
                <span class="label">Fees</span>
              </RouterLink>

              <RouterLink to="/reports" class="submenu-item" active-class="active">
                <span class="label">Reports</span>
              </RouterLink>
            </div>
          </transition>
        </div>

        <!-- Administration -->
        <div v-if="role === 'admin'" class="menu-group">
          <div
            class="menu-title"
            @click="toggleGroup('administration')"
            :title="collapsed ? 'Administration' : ''"
          >
            <div class="menu-title-left">
              <span class="icon">⚙️</span>
              <span v-if="!collapsed" class="label">Administration</span>
            </div>

            <span v-if="!collapsed" class="arrow" :class="{ open: openGroups.administration }">
              ⌄
            </span>
          </div>

          <transition name="slide">
            <div v-show="openGroups.administration && !collapsed" class="submenu">
              <RouterLink to="/staff" class="submenu-item" active-class="active">
                <span class="label">Staff</span>
              </RouterLink>

              <RouterLink to="/settings" class="submenu-item" active-class="active">
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
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

type GroupKey = 'academic' | 'finance' | 'administration'

const route = useRoute()

const collapsed = ref(false)
const role = ref<'admin' | 'staff' | 'finance'>('admin')

const isAcademicVisible = computed(() => role.value === 'admin' || role.value === 'staff')
const isFinanceVisible = computed(() => role.value === 'admin' || role.value === 'finance')

const openGroups = ref<Record<GroupKey, boolean>>({
  academic: true,
  finance: false,
  administration: false,
})

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}

const toggleGroup = (group: GroupKey) => {
  if (collapsed.value) return
  openGroups.value[group] = !openGroups.value[group]
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
    flex-basis 0.3s ease;
  overflow: hidden;
  box-sizing: border-box;
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

.title span:first-child {
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
  background: transparent;
}

.sidebar-menu-scroll::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.32);
  border-radius: 999px;
}

.sidebar-menu-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.56);
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.menu-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: transparent;
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
  background: transparent;
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
</style>
