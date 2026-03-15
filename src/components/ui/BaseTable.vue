<template>
  <table class="base-table">
    <slot />
  </table>
</template>

<style scoped>
.base-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.base-table th,
.base-table td {
  padding: 12px 15px;
  border-bottom: 1px solid var(--border-color);
}

.base-table th {
  background: #f9fafb;
  font-weight: 600;
}

.base-table tbody tr:hover {
  background: #f3f4f6;
}
</style>
