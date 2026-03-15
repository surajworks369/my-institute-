// src/types/attendance.ts

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave'

export interface Attendance {
  id: number
  date: string
  courseId: number
  batchId: number
  studentId: number
  status: AttendanceStatus
  note: string
  markedBy: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceCreateInput {
  date: string
  courseId: number
  batchId: number
  studentId: number
  status: AttendanceStatus
  note?: string
  markedBy?: string
}

export interface AttendanceUpdateInput {
  date?: string
  courseId?: number
  batchId?: number
  studentId?: number
  status?: AttendanceStatus
  note?: string
  markedBy?: string
}
