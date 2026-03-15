<template>
  <div class="layout-shell">
    <Sidebar />

    <div class="main-shell">
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
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '../components/layout/SidebarLayout.vue'
import Navbar from '../components/layout/NavbarLayout.vue'
import Footer from '../components/layout/FooterLayout.vue'

const route = useRoute()
const contentShellRef = ref<HTMLElement | null>(null)

const scrollContentToTop = async () => {
  await nextTick()

  if (contentShellRef.value) {
    contentShellRef.value.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    })
  }
}

watch(
  () => route.fullPath,
  async () => {
    await scrollContentToTop()
  },
  { immediate: true },
)
</script>

<style scoped>
.layout-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  transition: all 0.3s ease;
}

.main-shell {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: grid;
  grid-template-rows: 78px minmax(0, 1fr) 56px;
  overflow: hidden;
}

.content-shell {
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
  scroll-behavior: smooth;
}

.content-inner {
  min-height: 100%;
  padding: 20px;
  box-sizing: border-box;
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

/* content scrollbar */
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
</style>
