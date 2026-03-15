<template>
  <button :class="['base-btn', variant]">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: string
}>()
</script>

<style scoped>
.base-btn {
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 500;
  transition: 0.3s;
  cursor: pointer;
}

.primary {
  background: var(--primary);
  color: white;
}

.primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
}

.outline {
  border: 1px solid var(--primary);
  color: var(--primary);
}

.outline:hover {
  background: var(--primary);
  color: white;
}
</style>
