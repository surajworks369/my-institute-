// src/stores/staffStore.ts

import { defineStore } from 'pinia'
import type {
  Gender,
  Staff,
  StaffCreateInput,
  StaffRole,
  StaffStatus,
  StaffUpdateInput,
} from '@/types/staff'
import {
  MASTER_CITY_LIST,
  MASTER_STAFF_DEPARTMENTS,
  MASTER_STAFF_ROLES,
  MASTER_EMPLOYMENT_STATUSES,
} from '@/stores/erpMasterData'

const STORAGE_KEY = 'vbh_erp_staff_v3'

function nowISO(): string {
  return new Date().toISOString()
}

function loadFromStorage(): Staff[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as Staff[]) : []
  } catch {
    return []
  }
}

function saveToStorage(items: Staff[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export const staffRoleOptions: StaffRole[] = [
  'Admin',
  'Teacher',
  'Accountant',
  'Counsellor',
  'Receptionist',
  'Coordinator',
  'Support Staff',
]

export const departmentOptions: string[] = [...MASTER_STAFF_DEPARTMENTS]

export const qualificationOptions: string[] = [
  'B.Com',
  'B.Sc',
  'B.A',
  'M.Com',
  'M.Sc',
  'MBA',
  'B.Ed',
  'M.Ed',
  'BCA',
  'MCA',
]

export const cityOptions: string[] =
  MASTER_CITY_LIST.length > 0
    ? [...MASTER_CITY_LIST]
    : ['Mumbai', 'Pune', 'Nashik', 'Nagpur', 'Thane', 'Kolhapur', 'Aurangabad']

export const genderOptions: Gender[] = ['Male', 'Female', 'Other']

export const statusOptions: StaffStatus[] = [...MASTER_EMPLOYMENT_STATUSES]

const seedStaffNames = [
  'Amit Patil',
  'Priya Kulkarni',
  'Rahul Deshmukh',
  'Sneha Joshi',
  'Kiran Desai',
  'Pooja Patil',
  'Sagar Jadhav',
  'Neha Shinde',
  'Rohit Pawar',
  'Anjali More',
  'Vikram Salunkhe',
  'Komal Chavan',
  'Nitin Mane',
  'Shweta Bhosale',
  'Prasad Kadam',
  'Rutuja Sawant',
  'Ajinkya Khot',
  'Tejaswini Patil',
  'Mahesh Gaikwad',
  'Dipali More',
  'Omkar Chougule',
] as const

const seedAddresses = [
  'Main Road, Shahupuri',
  'Station Road, Rajarampuri',
  'Near Market Yard, Karveer',
  'College Road, Tarabai Park',
  'Datta Chowk, Ichalkaranji',
  'Laxmipuri Main Street',
  'Near Bus Stand, Jaysingpur',
  'Shivaji Peth Office Lane',
  'New Palace Area',
  'Near Railway Station',
] as const

function normalizeRole(role: unknown): StaffRole {
  return staffRoleOptions.includes(role as StaffRole) ? (role as StaffRole) : 'Teacher'
}

function normalizeStatus(status: unknown): StaffStatus {
  return statusOptions.includes(status as StaffStatus) ? (status as StaffStatus) : 'Active'
}

function normalizeGender(gender: unknown): Gender {
  return genderOptions.includes(gender as Gender) ? (gender as Gender) : 'Male'
}

function staffCodeFromIndex(index: number): string {
  return `STF-${String(1001 + index).padStart(4, '0')}`
}

function createEmail(fullName: string, index: number): string {
  const slug = fullName.toLowerCase().replace(/\s+/g, '.')
  return `${slug}${index + 1}@vastubhandar.edu`
}

function createPhone(index: number): string {
  return `98${String(10000000 + index).slice(0, 8)}`
}

function seedData(count = 21): Staff[] {
  const base = nowISO()

  return Array.from({ length: count }, (_, i): Staff => {
    const fullName = seedStaffNames[i % seedStaffNames.length]!
    const role = staffRoleOptions[i % staffRoleOptions.length]!
    const department = departmentOptions[i % departmentOptions.length]!
    const qualification = qualificationOptions[i % qualificationOptions.length]!
    const city = cityOptions[i % cityOptions.length]!
    const gender = genderOptions[i % genderOptions.length]!
    const status = statusOptions[i % statusOptions.length]!
    const addressBase = seedAddresses[i % seedAddresses.length]!

    return {
      id: i + 1,
      staffCode: staffCodeFromIndex(i),
      fullName,
      email: createEmail(fullName, i),
      phone: createPhone(i),
      role,
      department,
      qualification,
      experienceYears: (i % 12) + 1,
      gender,
      joiningDate: `202${i % 4}-${String((i % 12) + 1).padStart(2, '0')}-15`,
      salary: 18000 + i * 2200,
      address: `${addressBase}, ${city}`,
      city,
      status,
      notes: `${role} profile seeded for ERP demo and UI testing.`,
      createdAt: base,
      updatedAt: base,
    }
  })
}

function normalizeItems(items: Staff[]): Staff[] {
  return items
    .map(
      (item, index): Staff => ({
        id: Number(item.id || index + 1),
        staffCode: String(item.staffCode || staffCodeFromIndex(index)).trim(),
        fullName: String(item.fullName || '').trim(),
        email: String(item.email || '').trim(),
        phone: String(item.phone || '').trim(),
        role: normalizeRole(item.role),
        department: String(item.department || departmentOptions[0] || 'Administration').trim(),
        qualification: String(item.qualification || qualificationOptions[0] || 'Graduate').trim(),
        experienceYears: Math.max(0, Number(item.experienceYears || 0)),
        gender: normalizeGender(item.gender),
        joiningDate: String(item.joiningDate || '').trim(),
        salary: Math.max(0, Number(item.salary || 0)),
        address: String(item.address || '').trim(),
        city: String(item.city || cityOptions[0] || 'Pune').trim(),
        status: normalizeStatus(item.status),
        notes: String(item.notes || '').trim(),
        createdAt: String(item.createdAt || nowISO()),
        updatedAt: String(item.updatedAt || nowISO()),
      }),
    )
    .filter((item) => item.fullName && item.staffCode)
}

export const useStaffStore = defineStore('staff', {
  state: () => ({
    items: [] as Staff[],
    loaded: false,
  }),

  getters: {
    total: (state) => state.items.length,

    activeCount: (state) => state.items.filter((item) => item.status === 'Active').length,

    inactiveCount: (state) => state.items.filter((item) => item.status === 'Inactive').length,

    onLeaveCount: (state) => state.items.filter((item) => item.status === 'On Leave').length,

    totalSalary: (state) => state.items.reduce((sum, item) => sum + item.salary, 0),

    averageSalary: (state) =>
      state.items.length
        ? Math.round(state.items.reduce((sum, item) => sum + item.salary, 0) / state.items.length)
        : 0,

    getById: (state) => (id: number) => state.items.find((item) => item.id === id) ?? null,
  },

  actions: {
    init(force = false): void {
      if (this.loaded && !force) return

      const stored = loadFromStorage()
      this.items = stored.length ? normalizeItems(stored) : seedData(21)
      this.loaded = true
      saveToStorage(this.items)
    },

    create(payload: StaffCreateInput): Staff {
      const maxId = this.items.reduce((max, item) => Math.max(max, item.id), 0)
      const createdAt = nowISO()

      const created: Staff = {
        id: maxId + 1,
        staffCode: String(payload.staffCode).trim(),
        fullName: String(payload.fullName).trim(),
        email: String(payload.email).trim(),
        phone: String(payload.phone).trim(),
        role: normalizeRole(payload.role),
        department: String(payload.department).trim(),
        qualification: String(payload.qualification).trim(),
        experienceYears: Math.max(0, Number(payload.experienceYears)),
        gender: normalizeGender(payload.gender),
        joiningDate: String(payload.joiningDate).trim(),
        salary: Math.max(0, Number(payload.salary)),
        address: String(payload.address).trim(),
        city: String(payload.city).trim(),
        status: normalizeStatus(payload.status),
        notes: String(payload.notes || '').trim(),
        createdAt,
        updatedAt: createdAt,
      }

      this.items.unshift(created)
      saveToStorage(this.items)
      return created
    },

    update(id: number, patch: StaffUpdateInput): Staff | null {
      const index = this.items.findIndex((item) => item.id === id)
      if (index === -1) return null

      const current = this.items[index]
      if (!current) return null

      const updated: Staff = {
        id: current.id,
        staffCode: String(patch.staffCode ?? current.staffCode).trim(),
        fullName: String(patch.fullName ?? current.fullName).trim(),
        email: String(patch.email ?? current.email).trim(),
        phone: String(patch.phone ?? current.phone).trim(),
        role: normalizeRole(patch.role ?? current.role),
        department: String(patch.department ?? current.department).trim(),
        qualification: String(patch.qualification ?? current.qualification).trim(),
        experienceYears:
          patch.experienceYears !== undefined
            ? Math.max(0, Number(patch.experienceYears))
            : current.experienceYears,
        gender: normalizeGender(patch.gender ?? current.gender),
        joiningDate: String(patch.joiningDate ?? current.joiningDate).trim(),
        salary: patch.salary !== undefined ? Math.max(0, Number(patch.salary)) : current.salary,
        address: String(patch.address ?? current.address).trim(),
        city: String(patch.city ?? current.city).trim(),
        status: normalizeStatus(patch.status ?? current.status),
        notes: String(patch.notes ?? current.notes).trim(),
        createdAt: current.createdAt,
        updatedAt: nowISO(),
      }

      this.items[index] = updated
      saveToStorage(this.items)
      return updated
    },

    remove(id: number): boolean {
      const before = this.items.length
      this.items = this.items.filter((item) => item.id !== id)
      saveToStorage(this.items)
      return this.items.length !== before
    },

    removeMany(ids: number[]): Staff[] {
      if (!ids.length) return []

      const idSet = new Set(ids)
      const removed = this.items.filter((item) => idSet.has(item.id))
      this.items = this.items.filter((item) => !idSet.has(item.id))
      saveToStorage(this.items)
      return removed
    },

    restoreMany(records: Staff[]): boolean {
      if (!records.length) return false

      const existingIds = new Set(this.items.map((item) => item.id))
      const valid = records.filter((record) => !existingIds.has(record.id))
      if (!valid.length) return false

      this.items = [...valid, ...this.items].sort((a, b) => a.id - b.id)
      saveToStorage(this.items)
      return true
    },

    resetToSeed(count = 21): void {
      this.items = seedData(count)
      this.loaded = true
      saveToStorage(this.items)
    },
  },
})
