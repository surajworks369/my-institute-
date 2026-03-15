// src/types/settings.ts

/* ---------------------------------------------
   Institute Settings
--------------------------------------------- */

export interface InstituteSettings {
  instituteName: string
  address: string
  phone: string
  email: string
  website?: string
  logo?: string
}

/* ---------------------------------------------
   Academic Settings
--------------------------------------------- */

export interface AcademicSettings {
  academicYear: string
  defaultCourseDuration: number
  attendanceRequiredPercent: number
}

/* ---------------------------------------------
   Fees Settings
--------------------------------------------- */

export type Currency = 'INR' | 'USD' | 'EUR'

export interface FeesSettings {
  currency: Currency
  lateFeePerDay: number
  allowInstallments: boolean
  maxInstallments: number
}

/* ---------------------------------------------
   System Settings
--------------------------------------------- */

export type ThemeMode = 'Light' | 'Dark' | 'System'

export type DateFormat = 'DD-MM-YYYY' | 'MM-DD-YYYY' | 'YYYY-MM-DD'

export interface SystemSettings {
  theme: ThemeMode
  timezone: string
  dateFormat: DateFormat
}

/* ---------------------------------------------
   Root Settings Object
--------------------------------------------- */

export interface SettingsState {
  institute: InstituteSettings
  academic: AcademicSettings
  fees: FeesSettings
  system: SystemSettings
}

/* ---------------------------------------------
   Default Settings
--------------------------------------------- */

export const defaultSettings: SettingsState = {
  institute: {
    instituteName: 'Vastu Bhandar Institute',
    address: 'Kolhapur, Maharashtra',
    phone: '9876543210',
    email: 'info@vastubhandar.com',
    website: '',
    logo: '',
  },

  academic: {
    academicYear: '2025-2026',
    defaultCourseDuration: 12,
    attendanceRequiredPercent: 75,
  },

  fees: {
    currency: 'INR',
    lateFeePerDay: 50,
    allowInstallments: true,
    maxInstallments: 3,
  },

  system: {
    theme: 'Light',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD-MM-YYYY',
  },
}
