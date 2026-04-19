/**
 * `stores/settingsStore.ts` (Settings Store / Pinia)
 *
 * - **Purpose**: Manage institute/academic/fees/system settings state for forms.
 * - **Role in project**: Binds inputs on settings pages and persists preferences.
 * - **Logic type**:
 *   - localStorage persistence (`STORAGE_KEY`)
 *   - Merge into `defaultSettings` (partial saves stay safe)
 * - **File type**: Store (frontend / Pinia)
 *
 * Note: Settings live in localStorage today. With a multi-user backend, load/save can move to
 * per-institute or per-user APIs.
 */

import { defineStore } from 'pinia'
import type {
  SettingsState,
  InstituteSettings,
  AcademicSettings,
  FeesSettings,
  SystemSettings,
} from '@/types/settings'
import { defaultSettings } from '@/types/settings'

// localStorage key for settings persistence
const STORAGE_KEY = 'vbh_settings_v1'

// Load settings from localStorage merged with defaults
function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(defaultSettings)

    const parsed = JSON.parse(raw)

    return {
      institute: {
        ...defaultSettings.institute,
        ...parsed.institute,
      },

      academic: {
        ...defaultSettings.academic,
        ...parsed.academic,
      },

      fees: {
        ...defaultSettings.fees,
        ...parsed.fees,
      },

      system: {
        ...defaultSettings.system,
        ...parsed.system,
      },
    }
  } catch {
    return structuredClone(defaultSettings)
  }
}

// settings persist
function saveSettings(settings: SettingsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState & { loaded: boolean } => ({
    ...structuredClone(defaultSettings),
    loaded: false,
  }),

  getters: {
    instituteSettings: (state) => state.institute,
    academicSettings: (state) => state.academic,
    feesSettings: (state) => state.fees,
    systemSettings: (state) => state.system,
  },

  actions: {
    // Init: hydrate state from storage once
    init() {
      if (this.loaded) return

      const saved = loadSettings()

      this.institute = saved.institute
      this.academic = saved.academic
      this.fees = saved.fees
      this.system = saved.system

      this.loaded = true
    },

    // Institute settings update
    updateInstitute(data: InstituteSettings) {
      this.institute = { ...data }
      this.persist()
    },

    // Academic settings update
    updateAcademic(data: AcademicSettings) {
      this.academic = { ...data }
      this.persist()
    },

    // Fees settings update
    updateFees(data: FeesSettings) {
      this.fees = { ...data }
      this.persist()
    },

    // System settings update
    updateSystem(data: SystemSettings) {
      this.system = { ...data }
      this.persist()
    },

    // Reset: restore all settings to defaults
    resetAll() {
      const defaults = structuredClone(defaultSettings)

      this.institute = defaults.institute
      this.academic = defaults.academic
      this.fees = defaults.fees
      this.system = defaults.system

      this.persist()
    },

    // Persist helper: store state → localStorage
    persist() {
      const data: SettingsState = {
        institute: this.institute,
        academic: this.academic,
        fees: this.fees,
        system: this.system,
      }

      saveSettings(data)
    },
  },
})
