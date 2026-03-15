<template>
  <div class="fees-page fade-in">
    <section class="stats-grid">
      <div class="stat-card stat-card-total">
        <div class="stat-icon">💳</div>
        <div class="stat-content">
          <p>Total Records</p>
          <h3>{{ totalRecords }}</h3>
          <small>Fee records in system</small>
        </div>
      </div>

      <div class="stat-card stat-card-collected">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <p>Total Collected</p>
          <h3>{{ formatCurrencyShort(totalCollected) }}</h3>
          <small>Received fee amount</small>
        </div>
      </div>

      <div class="stat-card stat-card-pending">
        <div class="stat-icon">⌛</div>
        <div class="stat-content">
          <p>Total Pending</p>
          <h3>{{ formatCurrencyShort(totalPending) }}</h3>
          <small>Remaining collection</small>
        </div>
      </div>

      <div class="stat-card stat-card-status">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <p>Paid / Overdue</p>
          <h3>{{ paidCount }} / {{ overdueCount }}</h3>
          <small>Finance status overview</small>
        </div>
      </div>
    </section>

    <section class="panel card">
      <div class="section-top">
        <div class="title-block">
          <p class="eyebrow">Finance Management</p>
          <h2>Fees List</h2>
        </div>

        <div class="section-actions">
          <div class="search-box">
            <span class="search-icon">🔎</span>
            <input
              v-model="globalSearch"
              type="text"
              placeholder="Search by student, course, batch, receipt, status..."
            />
          </div>

          <router-link class="app-btn app-btn-primary app-btn-pill top-add-btn" to="/fees/add">
            + Add Fee
          </router-link>
        </div>
      </div>

      <div class="toolbar">
        <div class="quick-tabs">
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'All' }"
            @click="setQuickStatus('All')"
          >
            All
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Paid' }"
            @click="setQuickStatus('Paid')"
          >
            Paid
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Partial' }"
            @click="setQuickStatus('Partial')"
          >
            Partial
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Pending' }"
            @click="setQuickStatus('Pending')"
          >
            Pending
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Overdue' }"
            @click="setQuickStatus('Overdue')"
          >
            Overdue
          </button>
        </div>

        <div class="toolbar-grid">
          <div class="toolbar-field">
            <label>Course</label>
            <select v-model.number="courseFilter">
              <option :value="0">All Courses</option>
              <option v-for="course in courseOptions" :key="course.id" :value="course.id">
                {{ course.name }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Batch</label>
            <select v-model.number="batchFilter">
              <option :value="0">All Batches</option>
              <option v-for="batch in filteredBatchOptions" :key="batch.id" :value="batch.id">
                {{ batch.name }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Status</label>
            <select v-model="statusFilter">
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Payment Mode</label>
            <select v-model="paymentModeFilter">
              <option value="">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Due From</label>
            <input v-model="dateFrom" type="date" />
          </div>

          <div class="toolbar-field">
            <label>Due To</label>
            <input v-model="dateTo" type="date" />
          </div>
        </div>

        <div class="toolbar-actions">
          <div class="toolbar-actions-left">
            <button class="app-btn app-btn-secondary compact-btn" @click="resetAllFilters">
              Reset
            </button>
            <button class="app-btn app-btn-secondary compact-btn" @click="exportCsv">CSV</button>
            <button class="app-btn app-btn-secondary compact-btn" @click="exportExcel">
              Excel
            </button>
            <button class="app-btn app-btn-secondary compact-btn" @click="exportJson">JSON</button>
            <button class="app-btn app-btn-secondary compact-btn" @click="printTable">
              Print / PDF
            </button>
          </div>

          <div class="toolbar-actions-right">
            <button
              class="app-btn app-btn-danger compact-btn"
              :disabled="selectedIds.length === 0"
              @click="deleteSelectedFees"
            >
              Delete
            </button>

            <button
              v-if="showUndo"
              class="app-btn app-btn-secondary compact-btn"
              @click="undoDelete"
            >
              Undo
            </button>
          </div>
        </div>
      </div>

      <div class="table-meta">
        <div class="table-meta-left">
          <span class="meta-chip">{{ selectedIds.length }} selected</span>
          <span class="meta-chip soft-chip">{{ filteredRows.length }} records found</span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="fees-table">
          <thead>
            <tr>
              <th class="checkbox-col sticky-left">
                <input
                  type="checkbox"
                  :checked="isAllVisibleSelected"
                  @change="toggleSelectAllVisible"
                  aria-label="Select all visible fee records"
                />
              </th>

              <th class="sortable-th" @click="setSort('id')">
                <div class="th-content">
                  <span>ID</span>
                  <span class="sort-indicator">{{ getSortIndicator('id') }}</span>
                </div>
              </th>

              <th class="sortable-th" @click="setSort('studentName')">
                <div class="th-content">
                  <span>Student</span>
                  <span class="sort-indicator">{{ getSortIndicator('studentName') }}</span>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Course</span>
                  <select v-model.number="headerCourseFilter" @click.stop>
                    <option :value="0">All</option>
                    <option v-for="course in courseOptions" :key="course.id" :value="course.id">
                      {{ course.name }}
                    </option>
                  </select>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Batch</span>
                  <select v-model.number="headerBatchFilter" @click.stop>
                    <option :value="0">All</option>
                    <option v-for="batch in filteredBatchOptions" :key="batch.id" :value="batch.id">
                      {{ batch.name }}
                    </option>
                  </select>
                </div>
              </th>

              <th class="right sortable-th" @click="setSort('totalFees')">
                <div class="th-content">
                  <span>Total</span>
                  <span class="sort-indicator">{{ getSortIndicator('totalFees') }}</span>
                </div>
              </th>

              <th class="right sortable-th" @click="setSort('paidAmount')">
                <div class="th-content">
                  <span>Paid</span>
                  <span class="sort-indicator">{{ getSortIndicator('paidAmount') }}</span>
                </div>
              </th>

              <th class="right sortable-th" @click="setSort('pendingAmount')">
                <div class="th-content">
                  <span>Pending</span>
                  <span class="sort-indicator">{{ getSortIndicator('pendingAmount') }}</span>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Status</span>
                  <select v-model="headerStatusFilter" @click.stop>
                    <option value="">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </th>

              <th class="sortable-th" @click="setSort('dueDate')">
                <div class="th-content">
                  <span>Due Date</span>
                  <span class="sort-indicator">{{ getSortIndicator('dueDate') }}</span>
                </div>
              </th>

              <th>Payment Mode</th>
              <th>Receipt No</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredRows.length === 0">
              <td colspan="12" class="empty-state">No fee records found for current filters.</td>
            </tr>

            <tr
              v-for="row in filteredRows"
              :key="row.id"
              :class="{ 'row-selected': selectedIds.includes(row.id) }"
            >
              <td class="checkbox-col sticky-left body-sticky">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(row.id)"
                  @change="toggleSelection(row.id)"
                />
              </td>

              <td>#{{ row.id }}</td>

              <td>
                <button class="entity-link" @click="goView(row.id)">
                  <span class="entity-link-name">{{ row.studentName }}</span>
                  <span class="entity-link-meta">Student ID: {{ row.studentId }}</span>
                </button>
              </td>

              <td>{{ row.courseName }}</td>
              <td>{{ row.batchName }}</td>
              <td class="right">{{ formatCurrency(row.totalFees) }}</td>
              <td class="right">{{ formatCurrency(row.paidAmount) }}</td>
              <td class="right">{{ formatCurrency(row.pendingAmount) }}</td>

              <td>
                <span class="status-pill" :class="getStatusClass(row.status)">
                  {{ row.status }}
                </span>
              </td>

              <td>{{ formatDate(row.dueDate) }}</td>
              <td>{{ row.paymentMethod }}</td>
              <td>{{ row.receiptNo }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFeesStore } from '@/stores/feesStore'
import { useStudentStore } from '@/stores/studentsStore'
import { useCourseStore } from '@/stores/courseStore'
import { useBatchesStore } from '@/stores/batchesStore'
import type { Fee, FeeStatus, PaymentMethod } from '@/types/fee'

type SortField = 'id' | 'studentName' | 'totalFees' | 'paidAmount' | 'pendingAmount' | 'dueDate'
type SortDirection = 'asc' | 'desc'
type QuickStatus = 'All' | FeeStatus

const router = useRouter()

const feesStore = useFeesStore()
const studentStore = useStudentStore()
const courseStore = useCourseStore()
const batchStore = useBatchesStore()

const globalSearch = ref('')
const courseFilter = ref(0)
const batchFilter = ref(0)
const statusFilter = ref<'' | FeeStatus>('')
const paymentModeFilter = ref<'' | PaymentMethod>('')
const dateFrom = ref('')
const dateTo = ref('')
const quickStatus = ref<QuickStatus>('All')

const headerCourseFilter = ref(0)
const headerBatchFilter = ref(0)
const headerStatusFilter = ref<'' | FeeStatus>('')

const sortField = ref<SortField>('id')
const sortDirection = ref<SortDirection>('desc')

const selectedIds = ref<number[]>([])
const deletedFees = ref<Fee[]>([])
const showUndo = ref(false)

onMounted(() => {
  studentStore.init()
  courseStore.init()
  batchStore.init()
  feesStore.init()
})

watch(courseFilter, (value) => {
  if (!value) return
  const currentBatch = batchStore.getById(batchFilter.value)
  if (currentBatch && currentBatch.courseId !== value) {
    batchFilter.value = 0
  }
})

watch(headerCourseFilter, (value) => {
  if (!value) return
  const currentBatch = batchStore.getById(headerBatchFilter.value)
  if (currentBatch && currentBatch.courseId !== value) {
    headerBatchFilter.value = 0
  }
})

const courseOptions = computed(() => [...courseStore.courses])

const filteredBatchOptions = computed(() => {
  const courseIds = new Set<number>()
  if (courseFilter.value) courseIds.add(courseFilter.value)
  if (headerCourseFilter.value) courseIds.add(headerCourseFilter.value)
  if (!courseIds.size) return [...batchStore.batches]
  return batchStore.batches.filter((batch) => courseIds.has(batch.courseId))
})

const totalRecords = computed(() => feesStore.totalRecords)
const totalCollected = computed(() => feesStore.totalCollected)
const totalPending = computed(() => feesStore.totalPending)
const paidCount = computed(() => feesStore.paidCount)
const overdueCount = computed(() => feesStore.overdueCount)

const resolvedRows = computed(() => {
  return feesStore.fees.map((item) => {
    const student = studentStore.getStudentById(item.studentId)
    const course =
      courseStore.getCourseById(item.courseId) ??
      (student ? courseStore.getCourseByName(student.course) : null)

    const batch =
      batchStore.getById(item.batchId) ??
      (student
        ? (batchStore.batches.find(
            (entry) => entry.name === student.batch && (!course || entry.courseId === course.id),
          ) ?? batchStore.batches.find((entry) => entry.name === student.batch))
        : null)

    return {
      ...item,
      studentName: student?.name ?? `Student ${item.studentId}`,
      courseName: course?.name ?? 'Unknown Course',
      batchName: batch?.name ?? 'Unknown Batch',
    }
  })
})

const filteredRows = computed(() => {
  const query = globalSearch.value.trim().toLowerCase()

  const rows = [...resolvedRows.value].filter((row) => {
    const matchesGlobal =
      !query ||
      row.studentName.toLowerCase().includes(query) ||
      row.courseName.toLowerCase().includes(query) ||
      row.batchName.toLowerCase().includes(query) ||
      row.status.toLowerCase().includes(query) ||
      row.paymentMethod.toLowerCase().includes(query) ||
      row.receiptNo.toLowerCase().includes(query) ||
      row.note.toLowerCase().includes(query) ||
      String(row.id).includes(query)

    const matchesCourse = !courseFilter.value || row.courseId === courseFilter.value
    const matchesBatch = !batchFilter.value || row.batchId === batchFilter.value
    const matchesStatus = !statusFilter.value || row.status === statusFilter.value
    const matchesQuickStatus = quickStatus.value === 'All' || row.status === quickStatus.value
    const matchesPaymentMode =
      !paymentModeFilter.value || row.paymentMethod === paymentModeFilter.value
    const matchesDateFrom = !dateFrom.value || row.dueDate >= dateFrom.value
    const matchesDateTo = !dateTo.value || row.dueDate <= dateTo.value

    const matchesHeaderCourse =
      !headerCourseFilter.value || row.courseId === headerCourseFilter.value
    const matchesHeaderBatch = !headerBatchFilter.value || row.batchId === headerBatchFilter.value
    const matchesHeaderStatus = !headerStatusFilter.value || row.status === headerStatusFilter.value

    return (
      matchesGlobal &&
      matchesCourse &&
      matchesBatch &&
      matchesStatus &&
      matchesQuickStatus &&
      matchesPaymentMode &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesHeaderCourse &&
      matchesHeaderBatch &&
      matchesHeaderStatus
    )
  })

  rows.sort((a, b) => {
    if (sortField.value === 'id') {
      return sortDirection.value === 'asc' ? a.id - b.id : b.id - a.id
    }
    if (sortField.value === 'studentName') {
      return sortDirection.value === 'asc'
        ? a.studentName.localeCompare(b.studentName)
        : b.studentName.localeCompare(a.studentName)
    }
    if (sortField.value === 'totalFees') {
      return sortDirection.value === 'asc' ? a.totalFees - b.totalFees : b.totalFees - a.totalFees
    }
    if (sortField.value === 'paidAmount') {
      return sortDirection.value === 'asc'
        ? a.paidAmount - b.paidAmount
        : b.paidAmount - a.paidAmount
    }
    if (sortField.value === 'pendingAmount') {
      return sortDirection.value === 'asc'
        ? a.pendingAmount - b.pendingAmount
        : b.pendingAmount - a.pendingAmount
    }
    if (sortField.value === 'dueDate') {
      return sortDirection.value === 'asc'
        ? a.dueDate.localeCompare(b.dueDate)
        : b.dueDate.localeCompare(a.dueDate)
    }
    return 0
  })

  return rows
})

const isAllVisibleSelected = computed(() => {
  if (!filteredRows.value.length) return false
  return filteredRows.value.every((row) => selectedIds.value.includes(row.id))
})

function setQuickStatus(status: QuickStatus) {
  quickStatus.value = status
}

function toggleSelection(id: number) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
    return
  }
  selectedIds.value = [...selectedIds.value, id]
}

function toggleSelectAllVisible() {
  if (isAllVisibleSelected.value) {
    const visibleIds = new Set(filteredRows.value.map((row) => row.id))
    selectedIds.value = selectedIds.value.filter((id) => !visibleIds.has(id))
    return
  }

  const merged = new Set([...selectedIds.value, ...filteredRows.value.map((row) => row.id)])
  selectedIds.value = [...merged]
}

function setSort(field: SortField) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  sortField.value = field
  sortDirection.value = 'asc'
}

function getSortIndicator(field: SortField) {
  if (sortField.value !== field) return '↕'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

function resetAllFilters() {
  globalSearch.value = ''
  courseFilter.value = 0
  batchFilter.value = 0
  statusFilter.value = ''
  paymentModeFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  quickStatus.value = 'All'

  headerCourseFilter.value = 0
  headerBatchFilter.value = 0
  headerStatusFilter.value = ''

  sortField.value = 'id'
  sortDirection.value = 'desc'
}

function getStatusClass(status: FeeStatus) {
  if (status === 'Paid') return 'status-paid'
  if (status === 'Partial') return 'status-partial'
  if (status === 'Overdue') return 'status-overdue'
  return 'status-pending'
}

function goView(id: number) {
  router.push(`/fees/view/${id}`)
}

function deleteSelectedFees() {
  if (!selectedIds.value.length) return

  const confirmed = window.confirm(
    `Are you sure you want to delete ${selectedIds.value.length} selected fee record(s)?`,
  )
  if (!confirmed) return

  const removed = feesStore.removeMany(selectedIds.value)
  deletedFees.value = removed
  showUndo.value = removed.length > 0
  selectedIds.value = []
}

function undoDelete() {
  if (!deletedFees.value.length) return
  feesStore.restoreMany(deletedFees.value)
  deletedFees.value = []
  showUndo.value = false
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB')
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatCurrencyShort(value: number) {
  const amount = Number(value || 0)
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

function sanitize(value: string | number) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function getExportRows() {
  return filteredRows.value.map((row) => ({
    ID: row.id,
    Student: row.studentName,
    Course: row.courseName,
    Batch: row.batchName,
    TotalFees: row.totalFees,
    PaidAmount: row.paidAmount,
    PendingAmount: row.pendingAmount,
    Status: row.status,
    DueDate: row.dueDate,
    PaymentMode: row.paymentMethod,
    ReceiptNo: row.receiptNo,
    Note: row.note,
  }))
}

function downloadFile(content: BlobPart, fileName: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function exportCsv() {
  const rows = getExportRows()
  const headers = Object.keys(
    rows[0] ?? {
      ID: '',
      Student: '',
      Course: '',
      Batch: '',
      TotalFees: '',
      PaidAmount: '',
      PendingAmount: '',
      Status: '',
      DueDate: '',
      PaymentMode: '',
      ReceiptNo: '',
      Note: '',
    },
  )

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => sanitize(row[header as keyof typeof row])).join(','),
    ),
  ].join('\n')

  downloadFile(csv, 'fees-export.csv', 'text/csv;charset=utf-8;')
}

function exportExcel() {
  const rows = getExportRows()

  const tableHtml = `
    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Student</th>
          <th>Course</th>
          <th>Batch</th>
          <th>Total Fees</th>
          <th>Paid Amount</th>
          <th>Pending Amount</th>
          <th>Status</th>
          <th>Due Date</th>
          <th>Payment Mode</th>
          <th>Receipt No</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            <td>${row.ID}</td>
            <td>${row.Student}</td>
            <td>${row.Course}</td>
            <td>${row.Batch}</td>
            <td>${row.TotalFees}</td>
            <td>${row.PaidAmount}</td>
            <td>${row.PendingAmount}</td>
            <td>${row.Status}</td>
            <td>${row.DueDate}</td>
            <td>${row.PaymentMode}</td>
            <td>${row.ReceiptNo}</td>
            <td>${row.Note ?? ''}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  `

  downloadFile(tableHtml, 'fees-export.xls', 'application/vnd.ms-excel')
}

function exportJson() {
  const rows = getExportRows()
  downloadFile(JSON.stringify(rows, null, 2), 'fees-export.json', 'application/json')
}

function printTable() {
  const rows = getExportRows()

  const html = `
    <html>
      <head>
        <title>Fees Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h2 { margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h2>Fees Report</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Total Fees</th>
              <th>Paid Amount</th>
              <th>Pending Amount</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Payment Mode</th>
              <th>Receipt No</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
              <tr>
                <td>${row.ID}</td>
                <td>${row.Student}</td>
                <td>${row.Course}</td>
                <td>${row.Batch}</td>
                <td>${row.TotalFees}</td>
                <td>${row.PaidAmount}</td>
                <td>${row.PendingAmount}</td>
                <td>${row.Status}</td>
                <td>${row.DueDate}</td>
                <td>${row.PaymentMode}</td>
                <td>${row.ReceiptNo}</td>
                <td>${row.Note ?? ''}</td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `

  const printWindow = window.open('', '_blank', 'width=1200,height=800')
  if (!printWindow) return

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}
</script>

<style scoped>
.fees-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 22px 20px;
  color: white;
  min-height: 130px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.14);
}

.stat-card::after {
  content: '';
  position: absolute;
  inset: auto -30px -30px auto;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.stat-card-total {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

.stat-card-collected {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
}

.stat-card-pending {
  background: linear-gradient(135deg, #b45309, #f59e0b);
}

.stat-card-status {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
}

.stat-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  backdrop-filter: blur(10px);
  flex-shrink: 0;
}

.stat-content p {
  font-size: 14px;
  opacity: 0.92;
  margin-bottom: 6px;
}

.stat-content h3 {
  font-size: 34px;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-content small {
  opacity: 0.86;
  font-size: 12px;
}

.panel {
  padding: 22px;
  border-radius: 24px;
}

.section-top {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.title-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: #111827;
  margin-bottom: 8px;
}

.section-top h2 {
  font-size: 30px;
  font-weight: 800;
  line-height: 1.1;
}

.section-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-left: auto;
}

.search-box {
  width: 360px;
  max-width: 100%;
  position: relative;
}

.search-box input {
  padding-left: 42px;
  height: 50px;
  border-radius: 999px;
  background: #ffffff;
  border: 2px solid #c7d2fe;
  color: #111827;
  font-weight: 500;
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.08);
}

.search-box input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  font-size: 16px;
  opacity: 0.8;
}

.top-add-btn {
  min-width: 150px;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 14px;
  padding: 16px;
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.72)), var(--card-bg);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.quick-tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-tab {
  min-height: 38px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #243b73;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.22s ease;
}

.quick-tab:hover {
  background: #dbeafe;
  color: #1d4ed8;
}

.quick-tab.active {
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  color: #ffffff;
  border-color: transparent;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.18);
}

.toolbar-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.toolbar-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.toolbar-field label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.3px;
}

.toolbar-field select,
.toolbar-field input {
  min-height: 44px;
  background: #ffffff;
  border: 1px solid #dbe3f3;
  color: #111827;
  font-weight: 500;
}

.toolbar-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.toolbar-actions-left,
.toolbar-actions-right {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.compact-btn {
  min-height: 40px;
  padding: 8px 14px;
  font-size: 14px;
}

.table-meta {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.table-meta-left {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  background: rgba(79, 70, 229, 0.12);
  color: #3730a3;
}

.soft-chip {
  background: rgba(148, 163, 184, 0.14);
  color: #334155;
}

.table-wrapper {
  width: 100%;
  overflow: auto;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.92);
}

.fees-table {
  width: 100%;
  min-width: 1440px;
  border-collapse: collapse;
}

.fees-table thead th {
  position: sticky;
  top: 0;
  z-index: 3;
  background: linear-gradient(180deg, #eff4ff, #e9eefc);
  color: #1e293b;
  font-size: 13px;
  letter-spacing: 0.2px;
  font-weight: 800;
  padding: 12px 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  white-space: nowrap;
  vertical-align: top;
}

.sortable-th {
  cursor: pointer;
  user-select: none;
}

.th-content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sort-indicator {
  font-size: 12px;
  color: #64748b;
}

.th-filter-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
}

.th-filter-box span {
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;
}

.th-filter-box select {
  min-height: 34px;
  padding: 6px 8px;
  font-size: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
}

.fees-table tbody td {
  padding: 10px 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  white-space: nowrap;
  vertical-align: middle;
  color: #334155;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.98);
}

.fees-table tbody tr {
  transition: 0.22s ease;
}

.fees-table tbody tr:nth-child(even) td {
  background: rgba(248, 250, 252, 0.98);
}

.fees-table tbody tr:hover td {
  background: rgba(79, 70, 229, 0.05);
}

.row-selected td {
  background: rgba(79, 70, 229, 0.08) !important;
}

.checkbox-col {
  width: 58px;
  min-width: 58px;
  text-align: center;
}

.sticky-left {
  position: sticky;
  left: 0;
  z-index: 4;
}

.body-sticky {
  z-index: 1;
}

.entity-link {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  text-align: left;
}

.entity-link-name {
  color: var(--primary);
  font-weight: 800;
  font-size: 14px;
  line-height: 1.2;
}

.entity-link-meta {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
  opacity: 0.95;
}

.entity-link:hover .entity-link-name {
  text-decoration: underline;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.2px;
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

.right {
  text-align: right;
}

.empty-state {
  text-align: center;
  padding: 28px 16px !important;
  font-weight: 600;
  color: #64748b;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .section-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-actions {
    width: 100%;
    justify-content: flex-start;
    margin-left: 0;
  }

  .search-box {
    width: 100%;
  }

  .toolbar-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions-left,
  .toolbar-actions-right {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .toolbar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .fees-page {
    gap: 18px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: 16px;
  }

  .section-top h2 {
    font-size: 24px;
  }

  .toolbar {
    padding: 12px;
  }

  .toolbar-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-actions-left,
  .toolbar-actions-right {
    width: 100%;
  }

  .toolbar-actions-left > *,
  .toolbar-actions-right > * {
    flex: 1 1 100%;
  }

  .top-add-btn {
    width: 100%;
  }
}
</style>
