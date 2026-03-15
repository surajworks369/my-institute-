<template>
  <div class="base-card">
    <slot />
  </div>
</template>

<style scoped>
.base-card {
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  transition: 0.3s;
}

.base-card:hover {
  box-shadow: var(--shadow-md);
}
</style>
