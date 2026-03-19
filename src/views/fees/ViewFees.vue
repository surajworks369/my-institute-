<template>
  <div class="view-fee-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Fees</p>
        <h2>Fee Details</h2>
      </div>

      <div class="head-actions">
        <router-link to="/fees" class="app-btn app-btn-secondary app-btn-pill">
          Back to List
        </router-link>

        <button class="app-btn app-btn-primary app-btn-pill" @click="goEdit" :disabled="!fee">
          Edit Fee
        </button>
      </div>
    </div>

    <div v-if="!fee" class="not-found card">Fee record not found.</div>

    <div v-else class="view-layout">
      <div class="profile-card card">
        <div class="profile-top">
          <div class="avatar">{{ initials }}</div>
          <div class="profile-badge">Finance Summary</div>
        </div>

        <h3>{{ studentName }}</h3>
        <p>{{ courseName }}</p>

        <span class="status-pill" :class="getStatusClass(fee.status)">
          {{ fee.status }}
        </span>

        <div class="mini-summary">
          <div class="mini-box">
            <span>Total</span>
            <strong>{{ formatCurrency(fee.totalFees) }}</strong>
          </div>
          <div class="mini-box">
            <span>Pending</span>
            <strong>{{ formatCurrency(fee.pendingAmount) }}</strong>
          </div>
        </div>
      </div>

      <div class="details-card card">
        <h3>Fee Information</h3>

        <div class="details-grid">
          <div class="info-box">
            <label>Record ID</label>
            <p>#{{ fee.id }}</p>
          </div>

          <div class="info-box">
            <label>Student</label>
            <p>{{ studentName }}</p>
          </div>

          <div class="info-box">
            <label>Course</label>
            <p>{{ courseName }}</p>
          </div>

          <div class="info-box">
            <label>Batch</label>
            <p>{{ batchName }}</p>
          </div>

          <div class="info-box">
            <label>Total Fees</label>
            <p>{{ formatCurrency(fee.totalFees) }}</p>
          </div>

          <div class="info-box">
            <label>Paid Amount</label>
            <p>{{ formatCurrency(fee.paidAmount) }}</p>
          </div>

          <div class="info-box">
            <label>Pending Amount</label>
            <p>{{ formatCurrency(fee.pendingAmount) }}</p>
          </div>

          <div class="info-box">
            <label>Due Date</label>
            <p>{{ formatDate(fee.dueDate) }}</p>
          </div>

          <div class="info-box">
            <label>Payment Mode</label>
            <p>{{ fee.paymentMethod }}</p>
          </div>

          <div class="info-box">
            <label>Receipt No</label>
            <p>{{ fee.receiptNo }}</p>
          </div>

          <div class="info-box">
            <label>Created At</label>
            <p>{{ formatDateTime(fee.createdAt) }}</p>
          </div>

          <div class="info-box">
            <label>Updated At</label>
            <p>{{ formatDateTime(fee.updatedAt) }}</p>
          </div>

          <div class="info-box full-width">
            <label>Note</label>
            <p>{{ fee.note || '—' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="fee" class="payment-card card">
      <div class="payment-card-head">
        <div>
          <p class="eyebrow">Payments</p>
          <h3>Installment History</h3>
        </div>

        <button class="app-btn app-btn-primary" @click="showPaymentForm = !showPaymentForm">
          {{ showPaymentForm ? 'Hide Payment Form' : '+ Add Payment' }}
        </button>
      </div>

      <div v-if="showPaymentForm" class="payment-form-wrap">
        <div class="payment-form-grid">
          <div class="form-group">
            <label>Amount</label>
            <input v-model.number="paymentForm.amount" type="number" min="1" class="form-control" />
          </div>

          <div class="form-group">
            <label>Payment Date</label>
            <input v-model="paymentForm.paymentDate" type="date" class="form-control" />
          </div>

          <div class="form-group">
            <label>Payment Method</label>
            <select v-model="paymentForm.paymentMethod" class="form-control">
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div class="form-group span-2">
            <label>Note</label>
            <input
              v-model="paymentForm.note"
              type="text"
              class="form-control"
              placeholder="Optional payment note"
            />
          </div>
        </div>

        <div class="form-actions">
          <button class="app-btn app-btn-secondary" @click="resetPaymentForm">Reset</button>
          <button class="app-btn app-btn-primary" @click="addPayment">Save Payment</button>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Method</th>
              <th>Receipt No</th>
              <th>Note</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="!fee.installments.length">
              <td colspan="6" class="empty-state">No payments added yet.</td>
            </tr>

            <tr v-for="item in fee.installments" :key="item.id">
              <td>#{{ item.id }}</td>
              <td>{{ formatCurrency(item.amount) }}</td>
              <td>{{ formatDate(item.paymentDate) }}</td>
              <td>{{ item.paymentMethod }}</td>
              <td>{{ item.receiptNo || '-' }}</td>
              <td>{{ item.note || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onActivated, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFeesStore } from '@/stores/feesStore'
import { useStudentStore } from '@/stores/studentsStore'
import { useCourseStore } from '@/stores/courseStore'
import { useBatchesStore } from '@/stores/batchesStore'
import type { PaymentMethod, FeeStatus } from '@/types/fee'

const route = useRoute()
const router = useRouter()

const feesStore = useFeesStore()
const studentStore = useStudentStore()
const courseStore = useCourseStore()
const batchStore = useBatchesStore()

studentStore.init()
courseStore.init()
batchStore.init()
feesStore.init()

const id = Number(route.params.id)
const fee = computed(() => feesStore.getFeeById(id))

const student = computed(() =>
  fee.value ? studentStore.getStudentById(fee.value.studentId) : null,
)
const course = computed(() => {
  if (!fee.value) return null
  return (
    courseStore.getCourseById(fee.value.courseId) ??
    (student.value ? courseStore.getCourseByName(student.value.course) : null)
  )
})

const batch = computed(() => {
  if (!fee.value) return null
  return (
    batchStore.getById(fee.value.batchId) ??
    (student.value
      ? (batchStore.batches.find(
          (entry) =>
            entry.name === student.value?.batch &&
            (!course.value || entry.courseId === course.value.id),
        ) ?? batchStore.batches.find((entry) => entry.name === student.value?.batch))
      : null)
  )
})

const studentName = computed(() => student.value?.name ?? 'Unknown Student')
const courseName = computed(() => course.value?.name ?? 'Unknown Course')
const batchName = computed(() => batch.value?.name ?? 'Unknown Batch')

const initials = computed(() => {
  const name = studentName.value
  if (!name) return '--'
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
})

const showPaymentForm = ref(false)

function todayYMD() {
  return new Date().toISOString().slice(0, 10)
}

const paymentForm = reactive({
  amount: 0,
  paymentDate: todayYMD(),
  paymentMethod: 'Cash' as PaymentMethod,
  note: '',
})

function resetPaymentForm() {
  paymentForm.amount = 0
  paymentForm.paymentDate = todayYMD()
  paymentForm.paymentMethod = 'Cash'
  paymentForm.note = ''
}

function addPayment() {
  if (!fee.value) return

  if (!paymentForm.amount || paymentForm.amount <= 0) {
    alert('Please enter valid payment amount.')
    return
  }

  if (paymentForm.amount > fee.value.pendingAmount) {
    alert('Payment amount cannot be greater than pending amount.')
    return
  }

  if (!paymentForm.paymentDate) {
    alert('Please select payment date.')
    return
  }

  feesStore.addInstallment(fee.value.id, {
    amount: paymentForm.amount,
    paymentDate: paymentForm.paymentDate,
    paymentMethod: paymentForm.paymentMethod,
    note: paymentForm.note.trim(),
  })

  resetPaymentForm()
  showPaymentForm.value = false
}

function getStatusClass(status: FeeStatus) {
  if (status === 'Paid') return 'status-paid'
  if (status === 'Partial') return 'status-partial'
  if (status === 'Overdue') return 'status-overdue'
  return 'status-pending'
}

function goEdit() {
  if (!fee.value) return
  router.push(`/fees/edit/${fee.value.id}`)
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB')
}

function formatDateTime(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleString('en-GB')
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

const scrollPageToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  const selectors = [
    '.main-content',
    '.content-area',
    '.page-content',
    '.layout-content',
    '.main-layout-content',
    '.router-view-container',
  ]

  selectors.forEach((selector) => {
    const element = document.querySelector(selector)
    if (element instanceof HTMLElement) {
      element.scrollTop = 0
      element.scrollLeft = 0
    }
  })
}

const forceScrollTop = async () => {
  await nextTick()
  scrollPageToTop()

  requestAnimationFrame(() => {
    scrollPageToTop()
    setTimeout(() => {
      scrollPageToTop()
    }, 60)
  })
}

onMounted(async () => {
  await forceScrollTop()
})

onActivated(async () => {
  await forceScrollTop()
})
</script>

<style scoped>
.view-fee-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
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

.head-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.view-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
}

.profile-card,
.details-card,
.payment-card,
.not-found {
  border-radius: 24px;
  padding: 24px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  color: white;
  font-size: 28px;
  font-weight: 800;
  box-shadow: 0 16px 30px rgba(20, 184, 166, 0.2);
}

.profile-badge {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(20, 184, 166, 0.1);
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
}

.profile-card h3 {
  font-size: 24px;
  margin-bottom: 8px;
}

.profile-card p {
  color: #64748b;
  margin-bottom: 16px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 18px;
}

.status-paid {
  color: #065f46;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.18);
}

.status-partial {
  color: #92400e;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.18);
}

.status-pending {
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.14);
  border: 1px solid rgba(59, 130, 246, 0.18);
}

.status-overdue {
  color: #991b1b;
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.18);
}

.mini-summary {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 8px;
}

.mini-box {
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.04);
}

.mini-box span {
  display: block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  color: #64748b;
  margin-bottom: 8px;
}

.mini-box strong {
  font-size: 16px;
  color: #0f172a;
}

.details-card h3,
.payment-card h3 {
  font-size: 22px;
  margin-bottom: 18px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.info-box {
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.04);
}

.info-box label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  color: #64748b;
  margin-bottom: 8px;
}

.info-box p {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.full-width {
  grid-column: span 2;
}

.payment-card-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.payment-form-wrap {
  padding: 18px;
  border-radius: 18px;
  margin-bottom: 18px;
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.payment-form-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 14px;
}

.span-2 {
  grid-column: span 2;
}

.table-wrapper {
  width: 100%;
  overflow: auto;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.92);
}

.payments-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

.payments-table thead th {
  background: linear-gradient(180deg, #eff4ff, #e9eefc);
  color: #1e293b;
  font-size: 13px;
  letter-spacing: 0.2px;
  font-weight: 800;
  padding: 12px 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  white-space: nowrap;
}

.payments-table tbody td {
  padding: 10px 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  white-space: nowrap;
  vertical-align: middle;
  color: #334155;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.98);
}

.payments-table tbody tr:nth-child(even) td {
  background: rgba(248, 250, 252, 0.98);
}

.empty-state {
  text-align: center;
  padding: 28px 16px !important;
  font-weight: 600;
  color: #64748b;
}

.not-found {
  font-weight: 700;
  color: #b91c1c;
}

@media (max-width: 1100px) {
  .view-layout {
    grid-template-columns: 1fr;
  }

  .payment-form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .span-2 {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .page-head h2 {
    font-size: 24px;
  }

  .profile-card,
  .details-card,
  .payment-card,
  .not-found {
    padding: 16px;
  }

  .details-grid,
  .payment-form-grid,
  .mini-summary {
    grid-template-columns: 1fr;
  }

  .full-width,
  .span-2 {
    grid-column: span 1;
  }

  .head-actions {
    width: 100%;
  }

  .head-actions > *,
  .form-actions > * {
    width: 100%;
  }
}
</style>
