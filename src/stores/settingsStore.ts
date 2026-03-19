/**
 * `stores/settingsStore.ts` (Settings Store / Pinia)
 *
 * - **कशासाठी**: Institute/Academic/Fees/System settings state manage करणे (forms साठी).
 * - **Project मधली role**: Settings pages मध्ये inputs bind करून preferences persist करतो.
 * - **Logic प्रकार**:
 *   - localStorage persistence (`STORAGE_KEY`)
 *   - defaultSettings वर merge (partial saved settings सुद्धा safe)
 * - **File प्रकार**: store (frontend / Pinia)
 *
 * Note: सध्या settings localStorage मध्ये आहेत. पुढे multi-user backend आल्यावर
 * settings per-institute/per-user API ने load/save होतील.
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

// localStorage key: settings persistence साठी
const STORAGE_KEY = 'vbh_settings_v1'

// localStorage → settings load (defaultSettings merge सह)
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
    // Init: storage मधून state hydrate (एकदाच)
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

    // Reset: सर्व settings default वर
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
