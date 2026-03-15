export type StudentStatus = 'Active' | 'Inactive'
export type StudentGender = 'Male' | 'Female' | 'Other'

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
