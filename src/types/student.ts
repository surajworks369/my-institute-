/**
 * `types/student.ts` (Student Types)
 *
 * - **Purpose**: Define data shapes for the students module (stored record + form input).
 * - **Role in project**: Shared types for stores, views, and reports.
 * - **Logic type**: Types/interfaces only (no runtime logic).
 * - **File type**: Type definitions (frontend)
 */

export type StudentStatus = 'Active' | 'Inactive'
export type StudentGender = 'Male' | 'Female' | 'Other'

// Stored student record shape (list/table/report)
export interface Student {
  id: number
  name: string
  email: string
  phone: string
  course: string
  batch: string
  gender: StudentGender
  city: string
  admissionDate: string
  status: StudentStatus
}

// Form input shape (create/edit pages, v-model)
export interface StudentFormData {
  name: string
  email: string
  phone: string
  course: string
  batch: string
  gender: StudentGender
  city: string
  admissionDate: string
  status: StudentStatus
}
