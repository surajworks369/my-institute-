<template>
  <input :type="type" class="base-input" v-model="model" :placeholder="placeholder" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  modelValue: String,
  type: { type: String, default: 'text' },
  placeholder: String,
})

const emit = defineEmits(['update:modelValue'])

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<style scoped>
.base-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  transition: 0.3s;
}

.base-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}
</style>
