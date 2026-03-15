<template>
  <footer class="footer">
    <div class="left">
      <span>© {{ currentYear }} Institute Management ERP System</span>
      <span class="separator">|</span>
      <span
        >Logged in as <strong>{{ userRole }}</strong></span
      >
    </div>

    <div class="right">
      <span class="version">Version {{ version }}</span>
      <span class="separator">|</span>
      <span class="powered">Powered by Vue 3</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
const userRole = 'Admin'
const version = '1.0.0'
</script>

<style scoped>
.footer {
  height: 56px;
  min-height: 56px;
  background: rgba(255, 255, 255, 0.94);
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  font-size: 13px;
  color: #64748b;
  box-shadow: 0 -6px 20px rgba(15, 23, 42, 0.04);
  backdrop-filter: blur(12px);
  z-index: 5;
}

.left,
.right {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
}

.separator {
  color: #cbd5e1;
}

.version {
  font-weight: 600;
}

.powered {
  color: #2563eb;
  font-weight: 600;
}

:global(.dark) .footer {
  background: rgba(15, 23, 42, 0.94);
  border-top: 1px solid rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  box-shadow: 0 -8px 20px rgba(0, 0, 0, 0.18);
}

:global(.dark) .separator {
  color: #475569;
}

:global(.dark) .powered {
  color: #93c5fd;
}

@media (max-width: 900px) {
  .footer {
    height: auto;
    min-height: 56px;
    padding: 10px 16px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 6px;
  }

  .left,
  .right {
    gap: 8px;
  }
}
</style>
