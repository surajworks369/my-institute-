// src/types/course.ts

export type CourseStatus = 'Active' | 'Inactive'

export interface Course {
  id: number
  name: string
  code: string
  duration: string
  fees: number
  status: CourseStatus
  description: string
  startDate: string
  endDate: string
  maxStudents: number
  enrolledStudents: number
  batch: string
  trainer: string
  assistantTrainer: string
}

export type CourseFormData = Omit<Course, 'id' | 'enrolledStudents'> & {
  enrolledStudents?: number
}
