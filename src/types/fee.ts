// src/types/fee.ts

export type FeeStatus = 'Pending' | 'Partial' | 'Paid' | 'Overdue'
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Bank Transfer'

export interface FeeInstallment {
  id: number
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  receiptNo?: string
  note?: string
}

export interface Fee {
  id: number
  studentId: number
  courseId: number
  batchId: number
  totalFees: number
  paidAmount: number
  pendingAmount: number
  status: FeeStatus
  dueDate: string
  paymentMethod: PaymentMethod
  receiptNo: string
  note: string
  installments: FeeInstallment[]
  createdAt: string
  updatedAt: string
}

export interface FeeFormInput {
  studentId: number
  courseId: number
  batchId: number
  totalFees: number
  paidAmount: number
  dueDate: string
  paymentMethod: PaymentMethod
  receiptNo: string
  note: string
  installments?: FeeInstallment[]
}
