// src/types/exam.ts

export type ExamType = 'Unit' | 'Midterm' | 'Final' | 'Practical' | 'Other'
export type ExamStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'
export type PassFail = 'Pass' | 'Fail'

export interface Exam {
  id: number
  name: string
  code: string
  courseId: number
  batchId: number
  type: ExamType
  status: ExamStatus
  examDate: string
  startTime: string
  endTime: string
  totalMarks: number
  passingMarks: number
  instructions: string
  createdAt: string
  updatedAt: string
}

export interface ExamMark {
  id: number
  examId: number
  studentId: number
  batchId: number
  obtainedMarks: number
  status: PassFail
  checkedBy: string
  note: string
  createdAt: string
  updatedAt: string
}

export type ExamCreateInput = Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>
export type ExamUpdateInput = Partial<Omit<Exam, 'id' | 'createdAt'>>

export type ExamMarkCreateInput = Omit<ExamMark, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
  status?: PassFail
}

export type ExamMarkUpdateInput = Partial<Omit<ExamMark, 'id' | 'createdAt'>>

export const EXAM_TYPES: readonly ExamType[] = [
  'Unit',
  'Midterm',
  'Final',
  'Practical',
  'Other',
] as const

export const EXAM_STATUSES: readonly ExamStatus[] = [
  'Upcoming',
  'Ongoing',
  'Completed',
  'Cancelled',
] as const

export function clampMarks(value: number, min = 0, max = 100): number {
  const v = Number.isFinite(value) ? value : 0
  return Math.max(min, Math.min(max, v))
}

export function calcPassFail(obtainedMarks: number, passingMarks: number): PassFail {
  const ob = Number.isFinite(obtainedMarks) ? obtainedMarks : 0
  const pass = Number.isFinite(passingMarks) ? passingMarks : 0
  return ob >= pass ? 'Pass' : 'Fail'
}

export function normalizeExamStatus(v: unknown): ExamStatus {
  if (v === 'Upcoming' || v === 'Ongoing' || v === 'Completed' || v === 'Cancelled') return v
  return 'Upcoming'
}

export function normalizeExamType(v: unknown): ExamType {
  if (v === 'Unit' || v === 'Midterm' || v === 'Final' || v === 'Practical' || v === 'Other') {
    return v
  }
  return 'Other'
}
