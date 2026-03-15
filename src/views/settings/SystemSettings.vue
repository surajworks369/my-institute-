<template>
  <div class="page">
    <!-- Header -->
    <div class="top">
      <div>
        <h1 class="title">System Settings</h1>
        <p class="sub">Manage theme, timezone and date format for the ERP system.</p>
      </div>

      <button class="btn secondary" @click="goBack">← Back</button>
    </div>

    <!-- Form -->
    <div class="card">
      <form class="form" @submit.prevent="saveSettings">
        <div class="grid">
          <div class="field">
            <label>Theme *</label>
            <select v-model="form.theme" class="input">
              <option v-for="theme in themes" :key="theme" :value="theme">
                {{ theme }}
              </option>
            </select>
          </div>

          <div class="field">
            <label>Timezone *</label>
            <select v-model="form.timezone" class="input">
              <option v-for="zone in timezones" :key="zone" :value="zone">
                {{ zone }}
              </option>
            </select>
          </div>

          <div class="field full">
            <label>Date Format *</label>
            <select v-model="form.dateFormat" class="input">
              <option v-for="format in dateFormats" :key="format" :value="format">
                {{ format }}
              </option>
            </select>
          </div>
        </div>

        <!-- Preview -->
        <div class="preview-card">
          <h3 class="preview-title">Preview</h3>

          <div class="preview-grid">
            <div class="preview-item">
              <span class="preview-label">Theme</span>
              <span class="preview-value">{{ form.theme }}</span>
            </div>

            <div class="preview-item">
              <span class="preview-label">Timezone</span>
              <span class="preview-value">{{ form.timezone }}</span>
            </div>

            <div class="preview-item">
              <span class="preview-label">Date Format</span>
              <span class="preview-value">{{ form.dateFormat }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button type="button" class="btn secondary" @click="resetForm">Reset</button>

          <button type="submit" class="btn primary">Save Settings</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settingsStore'
import type { DateFormat, SystemSettings, ThemeMode } from '@/types/settings'

const router = useRouter()
const store = useSettingsStore()

const themes: ThemeMode[] = ['Light', 'Dark', 'System']

const timezones: string[] = [
  'Asia/Kolkata',
  'UTC',
  'Asia/Dubai',
  'Europe/London',
  'America/New_York',
]

const dateFormats: DateFormat[] = ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD']

const form = reactive<SystemSettings>({
  theme: 'Light',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD-MM-YYYY',
})

onMounted(() => {
  store.init()
  Object.assign(form, store.system)
})

function saveSettings() {
  store.updateSystem({
    ...form,
  })

  alert('System settings saved successfully')
}

function resetForm() {
  Object.assign(form, store.system)
}

function goBack() {
  router.push('/settings')
}
</script>

<style scoped>
.page {
  padding: 20px;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.title {
  font-size: 22px;
  font-weight: 900;
}

.sub {
  font-size: 13px;
  color: #667085;
}

.card {
  background: white;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
  padding: 18px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.field {
  display: flex;
  flex-direction: column;
}

.field.full {
  grid-column: 1 / -1;
}

label {
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 6px;
}

.input {
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 0 12px;
}

.preview-card {
  background: #f8fafc;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 16px;
}

.preview-title {
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 12px;
  color: #101828;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.preview-item {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-label {
  font-size: 12px;
  color: #667085;
  font-weight: 700;
}

.preview-value {
  font-size: 14px;
  color: #101828;
  font-weight: 800;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

.btn.primary {
  background: #2563eb;
  color: white;
}

.btn.secondary {
  background: #eef2f7;
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }

  .top {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
