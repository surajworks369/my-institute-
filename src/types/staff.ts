// src/types/staff.ts

export type StaffStatus = 'Active' | 'Inactive' | 'On Leave'

export type StaffRole =
  | 'Admin'
  | 'Teacher'
  | 'Accountant'
  | 'Counsellor'
  | 'Receptionist'
  | 'Coordinator'
  | 'Support Staff'

export type Gender = 'Male' | 'Female' | 'Other'

export const STAFF_STATUSES: readonly StaffStatus[] = ['Active', 'Inactive', 'On Leave'] as const

export const STAFF_ROLES: readonly StaffRole[] = [
  'Admin',
  'Teacher',
  'Accountant',
  'Counsellor',
  'Receptionist',
  'Coordinator',
  'Support Staff',
] as const

export const STAFF_GENDERS: readonly Gender[] = ['Male', 'Female', 'Other'] as const

export interface Staff {
  id: number

  staffCode: string
  fullName: string
  email: string
  phone: string

  role: StaffRole
  department: string
  qualification: string
  experienceYears: number

  gender: Gender
  joiningDate: string
  salary: number

  address: string
  city: string

  status: StaffStatus
  notes: string

  createdAt: string
  updatedAt: string
}

export interface StaffCreateInput {
  staffCode: string
  fullName: string
  email: string
  phone: string

  role: StaffRole
  department: string
  qualification: string
  experienceYears: number

  gender: Gender
  joiningDate: string
  salary: number

  address: string
  city: string

  status: StaffStatus
  notes: string
}

export interface StaffUpdateInput {
  staffCode?: string
  fullName?: string
  email?: string
  phone?: string

  role?: StaffRole
  department?: string
  qualification?: string
  experienceYears?: number

  gender?: Gender
  joiningDate?: string
  salary?: number

  address?: string
  city?: string

  status?: StaffStatus
  notes?: string

  updatedAt?: string
}

export function isValidStaffStatus(value: unknown): value is StaffStatus {
  return STAFF_STATUSES.includes(value as StaffStatus)
}

export function isValidStaffRole(value: unknown): value is StaffRole {
  return STAFF_ROLES.includes(value as StaffRole)
}

export function isValidStaffGender(value: unknown): value is Gender {
  return STAFF_GENDERS.includes(value as Gender)
}

export function normalizeStaffStatus(value: unknown): StaffStatus {
  return isValidStaffStatus(value) ? value : 'Active'
}

export function normalizeStaffRole(value: unknown): StaffRole {
  return isValidStaffRole(value) ? value : 'Teacher'
}

export function normalizeStaffGender(value: unknown): Gender {
  return isValidStaffGender(value) ? value : 'Male'
}
