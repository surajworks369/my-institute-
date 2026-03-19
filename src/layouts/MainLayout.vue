<template>
  <div class="layout-shell">
    <Sidebar
      :mobile-open="mobileSidebarOpen"
      @close-mobile="closeMobileSidebar"
      @toggle-mobile="toggleMobileSidebar"
    />

    <div v-if="mobileSidebarOpen" class="mobile-overlay" @click="closeMobileSidebar"></div>

    <div class="main-shell">
      <div class="mobile-topbar">
        <button class="mobile-menu-btn" type="button" @click="toggleMobileSidebar">☰</button>
        <div class="mobile-title">Institute ERP</div>
      </div>

      <Navbar />

      <main ref="contentShellRef" class="content-shell">
        <div class="content-inner">
          <router-view />
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../components/layout/SidebarLayout.vue'
import Navbar from '../components/layout/NavbarLayout.vue'
import Footer from '../components/layout/FooterLayout.vue'

const route = useRoute()
const contentShellRef = ref<HTMLElement | null>(null)
const mobileSidebarOpen = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 1024

  if (!isMobile.value) {
    mobileSidebarOpen.value = false
  }
}

const toggleMobileSidebar = () => {
  if (isMobile.value) {
    mobileSidebarOpen.value = !mobileSidebarOpen.value
  }
}

const closeMobileSidebar = () => {
  mobileSidebarOpen.value = false
}

watch(
  () => route.fullPath,
  async () => {
    await nextTick()

    if (isMobile.value) {
      closeMobileSidebar()
    }
  },
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
.layout-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  position: relative;
}

.main-shell {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: grid;
  grid-template-rows: 78px minmax(0, 1fr) 56px;
  overflow: hidden;
  position: relative;
}

.content-shell {
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

.content-inner {
  min-height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.mobile-topbar {
  display: none;
}

.mobile-overlay {
  display: none;
}

:global(.dark) .layout-shell {
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
}

:global(.dark) .content-shell {
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
}

:global(.dark) .content-inner {
  color: #f8fafc;
}

.content-shell::-webkit-scrollbar {
  width: 10px;
}

.content-shell::-webkit-scrollbar-track {
  background: rgba(148, 163, 184, 0.1);
}

.content-shell::-webkit-scrollbar-thumb {
  background: rgba(100, 116, 139, 0.45);
  border-radius: 999px;
}

.content-shell::-webkit-scrollbar-thumb:hover {
  background: rgba(100, 116, 139, 0.7);
}

@media (max-width: 1024px) {
  .main-shell {
    grid-template-rows: 60px 78px minmax(0, 1fr) 56px;
  }

  .mobile-topbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 16px;
    background: #ffffff;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
    z-index: 40;
  }

  .mobile-menu-btn {
    width: 42px;
    height: 42px;
    border: none;
    border-radius: 12px;
    background: linear-gradient(135deg, #3b82f6, #4f46e5);
    color: white;
    font-size: 20px;
    cursor: pointer;
  }

  .mobile-title {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    z-index: 80;
  }

  .content-inner {
    padding: 14px;
  }
}
</style>
