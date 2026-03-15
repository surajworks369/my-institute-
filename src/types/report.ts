// src/types/report.ts

export type StudentStatus = 'Active' | 'Inactive'
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave'
export type ExamResultStatus = 'Pass' | 'Fail'
export type FeeStatus = 'Paid' | 'Pending' | 'Partial' | 'Overdue'
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer'

export interface StudentReportRow {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  batchId: number
  batchName: string
  email: string
  phone: string
  gender: string
  city: string
  status: StudentStatus
  joinedDate: string
  createdAt: string
  updatedAt: string
}

export interface AttendanceReportRow {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  batchId: number
  batchName: string
  date: string
  status: AttendanceStatus
  markedBy: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface ExamReportRow {
  id: number
  examId: number
  examName: string
  courseId: number
  courseName: string
  batchId: number
  batchName: string
  studentId: number
  studentName: string
  obtainedMarks: number
  totalMarks: number
  percentage: number
  result: ExamResultStatus
  checkedBy: string
  examDate: string
  createdAt: string
  updatedAt: string
}

export interface FeesReportRow {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  batchId: number
  batchName: string
  totalFees: number
  paidAmount: number
  pendingAmount: number
  paymentMethod: PaymentMethod
  status: FeeStatus
  receiptNo: string
  dueDate: string
  note: string
  createdAt: string
  updatedAt: string
}

export interface ReportSummary {
  totalStudents: number
  activeStudents: number
  inactiveStudents: number

  totalAttendance: number
  presentCount: number
  absentCount: number
  lateCount: number
  leaveCount: number

  totalExams: number
  passCount: number
  failCount: number
  avgMarks: number

  totalFees: number
  totalCollected: number
  totalPending: number
  paidFeeCount: number
  partialFeeCount: number
  pendingFeeCount: number
  overdueFeeCount: number
}

export interface ReportFilters {
  search?: string
  batchId?: number
  courseId?: number
  examId?: number
  status?: string
  paymentMethod?: PaymentMethod | ''
  checkedBy?: string
  markedBy?: string
  fromDate?: string
  toDate?: string
}
