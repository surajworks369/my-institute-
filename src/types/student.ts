/**
 * `types/student.ts` (Student Types)
 *
 * - **कशासाठी**: Students module मधील data shape (Student + form input) define करणे.
 * - **Project मधली role**: Stores/Views/Reports मध्ये type-safety आणि consistent fields साठी वापर.
 * - **Logic प्रकार**: types/interfaces only (runtime logic नाही).
 * - **File प्रकार**: type (frontend)
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

// Form input shape (create/edit pages मध्ये v-model साठी)
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
