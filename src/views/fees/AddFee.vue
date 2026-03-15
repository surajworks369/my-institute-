<template>
  <div class="fee-form-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Fees</p>
        <h2>Add Fee</h2>
      </div>

      <router-link to="/fees" class="app-btn app-btn-secondary app-btn-pill">
        Back to List
      </router-link>
    </div>

    <div class="form-card card">
      <form class="fee-form" @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group span-2">
            <label>Student</label>
            <select v-model.number="form.studentId" class="form-control">
              <option :value="0">Select student</option>
              <option v-for="student in studentOptions" :key="student.id" :value="student.id">
                {{ student.name }} — {{ student.course }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Course</label>
            <input :value="resolvedCourseName" type="text" class="form-control readonly" readonly />
          </div>

          <div class="form-group">
            <label>Batch</label>
            <input :value="resolvedBatchName" type="text" class="form-control readonly" readonly />
          </div>

          <div class="form-group">
            <label>Total Fees</label>
            <input v-model.number="form.totalFees" type="number" min="0" class="form-control" />
          </div>

          <div class="form-group">
            <label>Initial Payment</label>
            <input v-model.number="form.paidAmount" type="number" min="0" class="form-control" />
          </div>

          <div class="form-group">
            <label>Pending Amount</label>
            <input :value="pendingAmount" type="number" class="form-control readonly" readonly />
          </div>

          <div class="form-group">
            <label>Status Preview</label>
            <input :value="statusPreview" type="text" class="form-control readonly" readonly />
          </div>

          <div class="form-group">
            <label>Due Date</label>
            <input v-model="form.dueDate" type="date" class="form-control" />
          </div>

          <div class="form-group">
            <label>Payment Mode</label>
            <select v-model="form.paymentMethod" class="form-control">
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div class="form-group">
            <label>Receipt No</label>
            <input
              v-model="form.receiptNo"
              type="text"
              class="form-control"
              placeholder="Auto generated if empty"
            />
          </div>

          <div class="form-group span-3">
            <label>Note</label>
            <textarea
              v-model="form.note"
              rows="4"
              class="form-control textarea-control"
              placeholder="Enter note or payment remarks"
            />
          </div>
        </div>

        <div class="summary-strip">
          <div class="summary-box">
            <span>Total Fees</span>
            <strong>{{ formatCurrency(form.totalFees) }}</strong>
          </div>
          <div class="summary-box">
            <span>Initial Payment</span>
            <strong>{{ formatCurrency(form.paidAmount) }}</strong>
          </div>
          <div class="summary-box">
            <span>Pending</span>
            <strong>{{ formatCurrency(pendingAmount) }}</strong>
          </div>
          <div class="summary-box">
            <span>Status</span>
            <strong>{{ statusPreview }}</strong>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="app-btn app-btn-secondary" @click="resetForm">Reset</button>
          <button type="submit" class="app-btn app-btn-primary">Save Fee</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFeesStore } from '@/stores/feesStore'
import { useStudentStore } from '@/stores/studentsStore'
import { useCourseStore } from '@/stores/courseStore'
import { useBatchesStore } from '@/stores/batchesStore'
import type { FeeStatus, PaymentMethod } from '@/types/fee'

const router = useRouter()
const feesStore = useFeesStore()
const studentStore = useStudentStore()
const courseStore = useCourseStore()
const batchStore = useBatchesStore()

studentStore.init()
courseStore.init()
batchStore.init()
feesStore.init()

function defaultDueDate() {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date.toISOString().slice(0, 10)
}

const getDefaultForm = () => ({
  studentId: 0,
  courseId: 0,
  batchId: 0,
  totalFees: 0,
  paidAmount: 0,
  dueDate: defaultDueDate(),
  paymentMethod: 'Cash' as PaymentMethod,
  receiptNo: '',
  note: '',
})

const form = reactive(getDefaultForm())

const studentOptions = computed(() => [...studentStore.students])

const selectedStudent = computed(() => {
  if (!form.studentId) return null
  return studentStore.getStudentById(form.studentId)
})

const selectedCourse = computed(() => {
  if (!selectedStudent.value) return null
  return courseStore.getCourseByName(selectedStudent.value.course)
})

const selectedBatch = computed(() => {
  if (!selectedStudent.value) return null

  return (
    batchStore.batches.find(
      (batch) =>
        batch.name === selectedStudent.value?.batch &&
        (!selectedCourse.value || batch.courseId === selectedCourse.value.id),
    ) ??
    batchStore.batches.find((batch) => batch.name === selectedStudent.value?.batch) ??
    null
  )
})

watch(
  () => form.studentId,
  () => {
    form.courseId = selectedCourse.value?.id ?? 0
    form.batchId = selectedBatch.value?.id ?? 0
    form.totalFees = Number(selectedCourse.value?.fees ?? 0)
  },
)

const resolvedCourseName = computed(() => selectedCourse.value?.name ?? '-')
const resolvedBatchName = computed(() => selectedBatch.value?.name ?? '-')

const pendingAmount = computed(() =>
  Math.max(Number(form.totalFees || 0) - Number(form.paidAmount || 0), 0),
)

const statusPreview = computed<FeeStatus>(() => {
  if (pendingAmount.value <= 0 && form.totalFees > 0) return 'Paid'

  const today = new Date().toISOString().slice(0, 10)
  if (form.dueDate && form.dueDate < today && pendingAmount.value > 0) return 'Overdue'

  if (form.paidAmount > 0 && form.paidAmount < form.totalFees) return 'Partial'
  return 'Pending'
})

function resetForm() {
  Object.assign(form, getDefaultForm())
}

function handleSubmit() {
  if (!form.studentId) {
    alert('Please select a student.')
    return
  }

  if (!form.courseId || !form.batchId) {
    alert('Selected student must have a valid course and batch.')
    return
  }

  if (!form.totalFees || form.totalFees <= 0) {
    alert('Please enter valid total fees.')
    return
  }

  if (!form.dueDate) {
    alert('Please select due date.')
    return
  }

  if (form.paidAmount < 0) {
    alert('Paid amount cannot be negative.')
    return
  }

  if (form.paidAmount > form.totalFees) {
    alert('Paid amount cannot be greater than total fees.')
    return
  }

  feesStore.addFee({
    studentId: form.studentId,
    courseId: form.courseId,
    batchId: form.batchId,
    totalFees: form.totalFees,
    paidAmount: form.paidAmount,
    dueDate: form.dueDate,
    paymentMethod: form.paymentMethod,
    receiptNo: form.receiptNo.trim(),
    note: form.note.trim(),
  })

  router.push('/fees')
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}
</script>

<style scoped>
.fee-form-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: #111827;
  margin-bottom: 6px;
}

.page-head h2 {
  font-size: 30px;
  font-weight: 800;
}

.form-card {
  border-radius: 24px;
  padding: 24px;
}

.fee-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.span-2 {
  grid-column: span 2;
}

.span-3 {
  grid-column: span 3;
}

.form-group label {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.form-control {
  min-height: 48px;
  border: 1.5px solid #cbd5e1 !important;
  background: #ffffff !important;
  color: #0f172a !important;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.04);
}

.form-control:hover {
  border-color: #94a3b8 !important;
}

.form-control:focus {
  border-color: #4f46e5 !important;
  box-shadow:
    0 0 0 4px rgba(79, 70, 229, 0.12),
    0 8px 18px rgba(79, 70, 229, 0.08) !important;
}

.readonly {
  background: #f8fafc !important;
}

.textarea-control {
  min-height: 120px;
  padding-top: 12px;
  resize: vertical;
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.summary-box {
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.04);
}

.summary-box span {
  display: block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  color: #64748b;
  margin-bottom: 8px;
}

.summary-box strong {
  font-size: 18px;
  color: #0f172a;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 8px;
}

@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .span-3 {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .page-head h2 {
    font-size: 24px;
  }

  .form-card {
    padding: 16px;
  }

  .form-grid,
  .summary-strip {
    grid-template-columns: 1fr;
  }

  .span-2,
  .span-3 {
    grid-column: span 1;
  }

  .form-actions > * {
    width: 100%;
  }
}
</style>
