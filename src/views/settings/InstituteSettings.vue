<template>
  <div class="settings-form-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Settings</p>
        <h2>Institute Settings</h2>
      </div>

      <router-link to="/settings" class="app-btn app-btn-secondary app-btn-pill">
        Back to Settings
      </router-link>
    </div>

    <div class="page-layout">
      <div class="main-card card">
        <form class="settings-form" @submit.prevent="saveSettings">
          <div class="form-grid">
            <div class="form-group">
              <label>Institute Name</label>
              <input v-model.trim="form.instituteName" class="form-control" />
            </div>

            <div class="form-group">
              <label>Phone</label>
              <input v-model.trim="form.phone" class="form-control" />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input v-model.trim="form.email" type="email" class="form-control" />
            </div>

            <div class="form-group">
              <label>Website</label>
              <input v-model.trim="form.website" class="form-control" placeholder="https://..." />
            </div>

            <div class="form-group full-width">
              <label>Address</label>
              <input v-model.trim="form.address" class="form-control" />
            </div>

            <div class="form-group full-width">
              <label>Logo URL</label>
              <input
                v-model.trim="form.logo"
                class="form-control"
                placeholder="Paste logo image URL"
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="app-btn app-btn-secondary" @click="resetForm">
              Reset
            </button>
            <button type="submit" class="app-btn app-btn-primary">Save Settings</button>
          </div>
        </form>
      </div>

      <div class="side-card card">
        <h3>Preview</h3>

        <div v-if="form.logo" class="logo-preview">
          <img :src="form.logo" alt="logo preview" />
        </div>

        <div class="preview-list">
          <div class="preview-item">
            <label>Institute</label>
            <p>{{ form.instituteName || '—' }}</p>
          </div>

          <div class="preview-item">
            <label>Phone</label>
            <p>{{ form.phone || '—' }}</p>
          </div>

          <div class="preview-item">
            <label>Email</label>
            <p>{{ form.email || '—' }}</p>
          </div>

          <div class="preview-item">
            <label>Website</label>
            <p>{{ form.website || '—' }}</p>
          </div>

          <div class="preview-item">
            <label>Address</label>
            <p>{{ form.address || '—' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import type { InstituteSettings } from '@/types/settings'

const store = useSettingsStore()

const form = reactive<InstituteSettings>({
  instituteName: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  logo: '',
})

onMounted(() => {
  store.init()
  Object.assign(form, store.institute)
})

function saveSettings() {
  if (!form.instituteName || !form.phone || !form.email || !form.address) {
    alert('Please fill all required fields.')
    return
  }

  store.updateInstitute({
    ...form,
  })

  alert('Institute settings saved successfully')
}

function resetForm() {
  Object.assign(form, store.institute)
}
</script>

<style scoped>
.settings-form-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: #111827;
  margin-bottom: 6px;
}

.page-head h2 {
  font-size: 30px;
  font-weight: 800;
}

.page-layout {
  display: grid;
  grid-template-columns: 1.35fr 0.8fr;
  gap: 20px;
}

.main-card,
.side-card {
  border-radius: 24px;
  padding: 24px;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.form-control {
  min-height: 48px;
  border: 1.5px solid #cbd5e1 !important;
  background: #ffffff !important;
  color: #0f172a !important;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.04);
  border-radius: 12px;
  padding: 0 14px;
}

.form-control:hover {
  border-color: #94a3b8 !important;
}

.form-control:focus {
  border-color: #4f46e5 !important;
  box-shadow:
    0 0 0 4px rgba(79, 70, 229, 0.12),
    0 8px 18px rgba(79, 70, 229, 0.08) !important;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.side-card h3 {
  font-size: 20px;
  font-weight: 900;
  color: #111827;
  margin-bottom: 16px;
}

.logo-preview {
  margin-bottom: 18px;
}

.logo-preview img {
  max-width: 100%;
  max-height: 90px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  padding: 8px;
  background: #fff;
}

.preview-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-item {
  padding: 14px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.preview-item label {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  margin-bottom: 6px;
}

.preview-item p {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  word-break: break-word;
}

@media (max-width: 1024px) {
  .page-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-head h2 {
    font-size: 24px;
  }

  .main-card,
  .side-card {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .form-actions > * {
    width: 100%;
  }
}
</style>
