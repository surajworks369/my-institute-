<template>
  <div class="stats-card">
    <div class="icon">{{ icon }}</div>
    <div>
      <h3>{{ value }}</h3>
      <p>{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  icon?: string
}>()
</script>

<style scoped>
.stats-card {
  background: white;
  padding: 25px;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: 0.3s;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.icon {
  font-size: 28px;
}

h3 {
  font-size: 22px;
  margin-bottom: 4px;
}

p {
  color: var(--text-light);
}
</style>
