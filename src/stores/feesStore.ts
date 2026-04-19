/**
 * `stores/feesStore.ts` (Fees Store / Pinia - setup style)
 *
 * - **Purpose**: Manage student fee records, installments, and status (Paid/Partial/Pending/Overdue).
 * - **Role in project**: Supplies fee totals, pending/overdue alerts, and recent payments to fee pages and the dashboard.
 * - **Logic type**:
 *   - localStorage persistence (`STORAGE_KEY`)
 *   - Seeded demo fee data
 *   - Paid/pending/status calculations
 *   - Recompute totals/status when installments are added
 * - **File type**: Store (frontend / Pinia)
 *
 * Note: The fee workflow is simulated in localStorage today. With a backend/API:
 * - Receipt numbers, payment capture, and due/overdue logic can move server-side
 * - Large datasets can use aggregates from backend reports
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useStudentStore } from '@/stores/studentsStore'
import { useCourseStore } from '@/stores/courseStore'
import { useBatchesStore } from '@/stores/batchesStore'
import type { Fee, FeeFormInput, FeeInstallment, FeeStatus, PaymentMethod } from '@/types/fee'

// localStorage key for fee persistence
const STORAGE_KEY = 'vbh_fees_v2'

// Timestamp/date helpers
function nowISO() {
  return new Date().toISOString()
}

function todayYMD() {
  return new Date().toISOString().slice(0, 10)
}

function addDaysYMD(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

// localStorage → fees load
function loadFromStorage(): Fee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as Fee[]) : []
  } catch {
    return []
  }
}

// fees persist
function saveToStorage(items: Fee[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

// Amount helpers: pending balance and status
function calculatePending(totalFees: number, paidAmount: number) {
  return Math.max(Number(totalFees || 0) - Number(paidAmount || 0), 0)
}

function calculateStatus(totalFees: number, paidAmount: number, dueDate: string): FeeStatus {
  const total = Number(totalFees || 0)
  const paid = Number(paidAmount || 0)
  const pending = calculatePending(total, paid)

  if (pending <= 0) return 'Paid'

  const today = todayYMD()
  if (dueDate && dueDate < today) return 'Overdue'

  if (paid > 0 && paid < total) return 'Partial'
  return 'Pending'
}

// Receipt helpers: pseudo-unique numbers for UI/print/export
function generateReceiptNo(id: number) {
  return `VBH-FEE-${String(id).padStart(5, '0')}`
}

function createInstallmentReceiptNo(feeId: number, installmentId: number) {
  return `VBH-PAY-${String(feeId).padStart(5, '0')}-${String(installmentId).padStart(3, '0')}`
}

// Seed/demo: build sample fee rows using student/course/batch linkage
function buildSeedFees(): Fee[] {
  const studentStore = useStudentStore()
  const courseStore = useCourseStore()
  const batchStore = useBatchesStore()

  studentStore.init()
  courseStore.init()
  batchStore.init()

  const selectedStudents = studentStore.students.slice(0, 12)

  return selectedStudents.map((student, index) => {
    const linkedCourse = courseStore.getCourseByName(student.course)
    const linkedBatch =
      batchStore.batches.find(
        (batch) =>
          batch.name === student.batch && (!linkedCourse || batch.courseId === linkedCourse.id),
      ) ?? batchStore.batches.find((batch) => batch.name === student.batch)

    const totalFees = Number(linkedCourse?.fees ?? 20000)
    const paidPattern = index % 4
    const paidAmount =
      paidPattern === 0
        ? totalFees
        : paidPattern === 1
          ? Math.round(totalFees * 0.5)
          : paidPattern === 2
            ? 0
            : Math.round(totalFees * 0.25)

    const dueDate = index % 3 === 0 ? addDaysYMD(-10) : addDaysYMD(15 + index)
    const id = index + 1
    const createdAt = new Date(
      `2026-02-${String((index % 9) + 1).padStart(2, '0')}T10:30:00`,
    ).toISOString()

    const initialInstallments: FeeInstallment[] =
      paidAmount > 0
        ? [
            {
              id: 1,
              amount: paidAmount,
              paymentDate: createdAt.slice(0, 10),
              paymentMethod: index % 2 === 0 ? 'UPI' : 'Cash',
              receiptNo: createInstallmentReceiptNo(id, 1),
              note: 'Initial payment',
            },
          ]
        : []

    return {
      id,
      studentId: student.id,
      courseId: linkedCourse?.id ?? 0,
      batchId: linkedBatch?.id ?? 0,
      totalFees,
      paidAmount,
      pendingAmount: calculatePending(totalFees, paidAmount),
      status: calculateStatus(totalFees, paidAmount, dueDate),
      dueDate,
      paymentMethod: index % 2 === 0 ? 'UPI' : 'Cash',
      receiptNo: generateReceiptNo(id),
      note: paidAmount === totalFees ? 'Full payment completed.' : 'Seeded fee record.',
      installments: initialInstallments,
      createdAt,
      updatedAt: createdAt,
    }
  })
}

// Storage normalize: coerce numeric/date fields and recompute status
function normalizeFees(stored: Fee[]): Fee[] {
  return stored
    .map((item, index) => {
      const id = Number(item.id) || index + 1
      const totalFees = Number(item.totalFees || 0)
      const paidAmount = Number(item.paidAmount || 0)
      const dueDate = item.dueDate || addDaysYMD(30)
      const installments = Array.isArray(item.installments) ? item.installments : []

      return {
        id,
        studentId: Number(item.studentId || 0),
        courseId: Number(item.courseId || 0),
        batchId: Number(item.batchId || 0),
        totalFees,
        paidAmount,
        pendingAmount: calculatePending(totalFees, paidAmount),
        status: calculateStatus(totalFees, paidAmount, dueDate),
        dueDate,
        paymentMethod: item.paymentMethod || 'Cash',
        receiptNo: item.receiptNo || generateReceiptNo(id),
        note: item.note || '',
        installments,
        createdAt: item.createdAt || nowISO(),
        updatedAt: item.updatedAt || nowISO(),
      }
    })
    .sort((a, b) => a.id - b.id)
}

export const useFeesStore = defineStore('fees', () => {
  const fees = ref<Fee[]>([])
  const loaded = ref(false)

  // Init: related stores init + stored/seed fees load
  function init(force = false) {
    if (loaded.value && !force) return

    const studentStore = useStudentStore()
    const courseStore = useCourseStore()
    const batchStore = useBatchesStore()

    studentStore.init()
    courseStore.init()
    batchStore.init()

    const stored = loadFromStorage()
    const normalized = normalizeFees(stored)

    fees.value = normalized.length ? normalized : buildSeedFees()
    loaded.value = true
    saveToStorage(fees.value)
  }

  // Next id from the local list
  function nextId() {
    return fees.value.reduce((max, item) => Math.max(max, item.id), 0) + 1
  }

  // Lookup helper
  function getFeeById(id: number) {
    return fees.value.find((item) => item.id === id) ?? null
  }

  // Student-wise fees list
  function feesByStudent(studentId: number) {
    return fees.value.filter((item) => item.studentId === studentId)
  }

  // CRUD: create fee record (optional initial installment)
  function addFee(payload: FeeFormInput) {
    const id = nextId()
    const totalFees = Number(payload.totalFees || 0)
    const paidAmount = Number(payload.paidAmount || 0)
    const dueDate = payload.dueDate || addDaysYMD(30)
    const createdAt = nowISO()

    const installments =
      paidAmount > 0
        ? [
            {
              id: 1,
              amount: paidAmount,
              paymentDate: todayYMD(),
              paymentMethod: payload.paymentMethod,
              receiptNo: createInstallmentReceiptNo(id, 1),
              note: 'Initial payment',
            },
          ]
        : []

    const created: Fee = {
      id,
      studentId: payload.studentId,
      courseId: payload.courseId,
      batchId: payload.batchId,
      totalFees,
      paidAmount,
      pendingAmount: calculatePending(totalFees, paidAmount),
      status: calculateStatus(totalFees, paidAmount, dueDate),
      dueDate,
      paymentMethod: payload.paymentMethod,
      receiptNo: payload.receiptNo?.trim() || generateReceiptNo(id),
      note: payload.note?.trim() || '',
      installments: payload.installments?.length ? payload.installments : installments,
      createdAt,
      updatedAt: createdAt,
    }

    fees.value.unshift(created)
    saveToStorage(fees.value)
    return created
  }

  // CRUD: update fee record (status recompute)
  function updateFee(id: number, payload: FeeFormInput) {
    const index = fees.value.findIndex((item) => item.id === id)
    if (index === -1) return null

    const current = fees.value[index]
    if (!current) return null

    const totalFees = Number(payload.totalFees || 0)
    const paidAmount = Number(payload.paidAmount || 0)
    const dueDate = payload.dueDate || current.dueDate || addDaysYMD(30)

    const updated: Fee = {
      ...current,
      studentId: payload.studentId,
      courseId: payload.courseId,
      batchId: payload.batchId,
      totalFees,
      paidAmount,
      pendingAmount: calculatePending(totalFees, paidAmount),
      status: calculateStatus(totalFees, paidAmount, dueDate),
      dueDate,
      paymentMethod: payload.paymentMethod,
      receiptNo: payload.receiptNo?.trim() || current.receiptNo || generateReceiptNo(id),
      note: payload.note?.trim() || '',
      installments: Array.isArray(payload.installments)
        ? payload.installments
        : current.installments,
      updatedAt: nowISO(),
    }

    fees.value[index] = updated
    saveToStorage(fees.value)
    return updated
  }

  // CRUD: delete single fee record
  function deleteFee(id: number) {
    const index = fees.value.findIndex((item) => item.id === id)
    if (index === -1) return false

    fees.value.splice(index, 1)
    saveToStorage(fees.value)
    return true
  }

  // CRUD: bulk delete
  function removeMany(ids: number[]) {
    if (!ids.length) return []

    const idSet = new Set(ids)
    const removed = fees.value.filter((item) => idSet.has(item.id))
    const remaining = fees.value.filter((item) => !idSet.has(item.id))

    fees.value = remaining
    saveToStorage(fees.value)
    return removed
  }

  // Undo/restore: restore backup rows (avoid id clashes)
  function restoreMany(items: Fee[]) {
    if (!items.length) return false

    const existingIds = new Set(fees.value.map((item) => item.id))
    const valid = items.filter((item) => !existingIds.has(item.id))
    if (!valid.length) return false

    fees.value.push(...valid)
    fees.value.sort((a, b) => a.id - b.id)
    saveToStorage(fees.value)
    return true
  }

  // Payment flow: installment add → paid/pending/status recalculation
  function addInstallment(
    feeId: number,
    payload: Omit<FeeInstallment, 'id' | 'receiptNo'> & { receiptNo?: string },
  ) {
    const fee = getFeeById(feeId)
    if (!fee) return null

    const installmentId = fee.installments.reduce((max, item) => Math.max(max, item.id), 0) + 1

    const created: FeeInstallment = {
      id: installmentId,
      amount: Number(payload.amount || 0),
      paymentDate: payload.paymentDate || todayYMD(),
      paymentMethod: payload.paymentMethod,
      receiptNo: payload.receiptNo?.trim() || createInstallmentReceiptNo(feeId, installmentId),
      note: payload.note?.trim() || '',
    }

    fee.installments.push(created)
    fee.paidAmount = fee.installments.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    fee.pendingAmount = calculatePending(fee.totalFees, fee.paidAmount)
    fee.status = calculateStatus(fee.totalFees, fee.paidAmount, fee.dueDate)
    fee.updatedAt = nowISO()

    saveToStorage(fees.value)
    return created
  }

  // Dashboard aggregates / quick stats
  const totalRecords = computed(() => fees.value.length)
  const totalCollected = computed(() => fees.value.reduce((sum, item) => sum + item.paidAmount, 0))
  const totalPending = computed(() => fees.value.reduce((sum, item) => sum + item.pendingAmount, 0))
  const paidCount = computed(() => fees.value.filter((item) => item.status === 'Paid').length)
  const partialCount = computed(() => fees.value.filter((item) => item.status === 'Partial').length)
  const pendingCount = computed(() => fees.value.filter((item) => item.status === 'Pending').length)
  const overdueCount = computed(() => fees.value.filter((item) => item.status === 'Overdue').length)

  return {
    fees,
    loaded,

    init,
    getFeeById,
    feesByStudent,
    addFee,
    updateFee,
    deleteFee,
    removeMany,
    restoreMany,
    addInstallment,

    totalRecords,
    totalCollected,
    totalPending,
    paidCount,
    partialCount,
    pendingCount,
    overdueCount,
  }
})
