// src/stores/settingsStore.ts

import { defineStore } from 'pinia'
import type {
  SettingsState,
  InstituteSettings,
  AcademicSettings,
  FeesSettings,
  SystemSettings,
} from '@/types/settings'
import { defaultSettings } from '@/types/settings'

const STORAGE_KEY = 'vbh_settings_v1'

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
    init() {
      if (this.loaded) return

      const saved = loadSettings()

      this.institute = saved.institute
      this.academic = saved.academic
      this.fees = saved.fees
      this.system = saved.system

      this.loaded = true
    },

    updateInstitute(data: InstituteSettings) {
      this.institute = { ...data }
      this.persist()
    },

    updateAcademic(data: AcademicSettings) {
      this.academic = { ...data }
      this.persist()
    },

    updateFees(data: FeesSettings) {
      this.fees = { ...data }
      this.persist()
    },

    updateSystem(data: SystemSettings) {
      this.system = { ...data }
      this.persist()
    },

    resetAll() {
      const defaults = structuredClone(defaultSettings)

      this.institute = defaults.institute
      this.academic = defaults.academic
      this.fees = defaults.fees
      this.system = defaults.system

      this.persist()
    },

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
