<template>
  <div class="attendance-page fade-in">
    <section class="stats-grid">
      <div class="stat-card stat-card-total">
        <div class="stat-icon">🗂️</div>
        <div class="stat-content">
          <p>Total Records</p>
          <h3>{{ totalRecords }}</h3>
          <small>Attendance entries in system</small>
        </div>
      </div>

      <div class="stat-card stat-card-present">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <p>Present</p>
          <h3>{{ presentCount }}</h3>
          <small>Students marked present</small>
        </div>
      </div>

      <div class="stat-card stat-card-absent">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <p>Absent</p>
          <h3>{{ absentCount }}</h3>
          <small>Students marked absent</small>
        </div>
      </div>

      <div class="stat-card stat-card-support">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <p>Late / Leave</p>
          <h3>{{ lateCount }} / {{ leaveCount }}</h3>
          <small>Special attendance statuses</small>
        </div>
      </div>
    </section>

    <section class="panel card">
      <div class="section-top">
        <div class="title-block">
          <p class="eyebrow">Academic Management</p>
          <h2>Attendance List</h2>
        </div>

        <div class="section-actions">
          <div class="search-box">
            <span class="search-icon">🔎</span>
            <input
              v-model="globalSearch"
              type="text"
              placeholder="Search by student, course, batch, status, marker..."
            />
          </div>

          <router-link
            class="app-btn app-btn-primary app-btn-pill top-add-btn"
            to="/attendance/add"
          >
            + Mark Attendance
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
            :class="{ active: quickStatus === 'Present' }"
            @click="setQuickStatus('Present')"
          >
            Present
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Absent' }"
            @click="setQuickStatus('Absent')"
          >
            Absent
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Late' }"
            @click="setQuickStatus('Late')"
          >
            Late
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Leave' }"
            @click="setQuickStatus('Leave')"
          >
            Leave
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
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Leave">Leave</option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Date From</label>
            <input v-model="dateFrom" type="date" />
          </div>

          <div class="toolbar-field">
            <label>Date To</label>
            <input v-model="dateTo" type="date" />
          </div>

          <div class="toolbar-field">
            <label>Marked By</label>
            <input v-model.trim="markedByFilter" type="text" placeholder="Admin / Staff" />
          </div>
        </div>

        <div class="toolbar-actions">
          <div class="toolbar-actions-left">
            <button class="app-btn app-btn-secondary compact-btn" @click="resetAllFilters">
              Reset
            </button>
            <button class="app-btn app-btn-secondary compact-btn" @click="exportCsv">CSV</button>
            <button class="app-btn app-btn-secondary compact-btn" @click="exportJson">JSON</button>
            <button class="app-btn app-btn-secondary compact-btn" @click="printTable">
              Print / PDF
            </button>
          </div>

          <div class="toolbar-actions-right">
            <button
              class="app-btn app-btn-danger compact-btn"
              :disabled="selectedIds.length === 0"
              @click="deleteSelectedRecords"
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
        <table class="attendance-table">
          <thead>
            <tr>
              <th class="checkbox-col sticky-left">
                <input
                  type="checkbox"
                  :checked="isAllVisibleSelected"
                  @change="toggleSelectAllVisible"
                  aria-label="Select all visible attendance records"
                />
              </th>

              <th class="sortable-th" @click="setSort('id')">
                <div class="th-content">
                  <span>ID</span>
                  <span class="sort-indicator">{{ getSortIndicator('id') }}</span>
                </div>
              </th>

              <th class="sortable-th" @click="setSort('date')">
                <div class="th-content">
                  <span>Date</span>
                  <span class="sort-indicator">{{ getSortIndicator('date') }}</span>
                </div>
              </th>

              <th>Student</th>

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

              <th>
                <div class="th-filter-box">
                  <span>Status</span>
                  <select v-model="headerStatusFilter" @click.stop>
                    <option value="">All</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Leave">Leave</option>
                  </select>
                </div>
              </th>

              <th>Marked By</th>
              <th>Note</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredRows.length === 0">
              <td colspan="9" class="empty-state">
                No attendance records found for current filters.
              </td>
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
              <td>{{ formatDate(row.date) }}</td>

              <td>
                <button class="entity-link" @click="goView(row.id)">
                  <span class="entity-link-name">{{ row.studentName }}</span>
                  <span class="entity-link-meta">Student ID: {{ row.studentId }}</span>
                </button>
              </td>

              <td>{{ row.courseName }}</td>
              <td>{{ row.batchName }}</td>

              <td>
                <span class="status-pill" :class="getStatusClass(row.status)">
                  {{ row.status }}
                </span>
              </td>

              <td>{{ row.markedBy || 'Admin' }}</td>
              <td class="note-cell">{{ row.note || '—' }}</td>
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
import { useAttendanceStore } from '@/stores/attendanceStore'
import { useBatchesStore } from '@/stores/batchesStore'
import { useCourseStore } from '@/stores/courseStore'
import { useStudentStore } from '@/stores/studentsStore'
import type { Attendance, AttendanceStatus } from '@/types/attendance'

type SortField = 'id' | 'date' | 'studentName' | 'courseName' | 'batchName'
type SortDirection = 'asc' | 'desc'
type QuickStatus = 'All' | AttendanceStatus

const router = useRouter()

const attendanceStore = useAttendanceStore()
const batchStore = useBatchesStore()
const courseStore = useCourseStore()
const studentStore = useStudentStore()

const globalSearch = ref('')
const courseFilter = ref(0)
const batchFilter = ref(0)
const statusFilter = ref<'' | AttendanceStatus>('')
const dateFrom = ref('')
const dateTo = ref('')
const markedByFilter = ref('')
const quickStatus = ref<QuickStatus>('All')

const headerCourseFilter = ref(0)
const headerBatchFilter = ref(0)
const headerStatusFilter = ref<'' | AttendanceStatus>('')

const sortField = ref<SortField>('date')
const sortDirection = ref<SortDirection>('desc')

const selectedIds = ref<number[]>([])
const deletedRecords = ref<Attendance[]>([])
const showUndo = ref(false)

onMounted(() => {
  courseStore.init()
  batchStore.init()
  studentStore.init()
  attendanceStore.init()
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

const totalRecords = computed(() => attendanceStore.total)
const presentCount = computed(() => attendanceStore.presentCount)
const absentCount = computed(() => attendanceStore.absentCount)
const lateCount = computed(() => attendanceStore.lateCount)
const leaveCount = computed(() => attendanceStore.leaveCount)

const resolvedRows = computed(() => {
  return attendanceStore.items.map((item) => {
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
  const marker = markedByFilter.value.trim().toLowerCase()

  const rows = [...resolvedRows.value].filter((row) => {
    const markedByText = (row.markedBy ?? '').toLowerCase()
    const noteText = (row.note ?? '').toLowerCase()

    const matchesGlobal =
      !query ||
      row.studentName.toLowerCase().includes(query) ||
      row.courseName.toLowerCase().includes(query) ||
      row.batchName.toLowerCase().includes(query) ||
      row.status.toLowerCase().includes(query) ||
      markedByText.includes(query) ||
      noteText.includes(query) ||
      String(row.id).includes(query)

    const matchesCourse = !courseFilter.value || row.courseId === courseFilter.value
    const matchesBatch = !batchFilter.value || row.batchId === batchFilter.value
    const matchesStatus = !statusFilter.value || row.status === statusFilter.value
    const matchesQuickStatus = quickStatus.value === 'All' || row.status === quickStatus.value
    const matchesMarkedBy = !marker || markedByText.includes(marker)
    const matchesDateFrom = !dateFrom.value || row.date >= dateFrom.value
    const matchesDateTo = !dateTo.value || row.date <= dateTo.value

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
      matchesMarkedBy &&
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
    if (sortField.value === 'date') {
      return sortDirection.value === 'asc'
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date)
    }
    if (sortField.value === 'studentName') {
      return sortDirection.value === 'asc'
        ? a.studentName.localeCompare(b.studentName)
        : b.studentName.localeCompare(a.studentName)
    }
    if (sortField.value === 'courseName') {
      return sortDirection.value === 'asc'
        ? a.courseName.localeCompare(b.courseName)
        : b.courseName.localeCompare(a.courseName)
    }
    if (sortField.value === 'batchName') {
      return sortDirection.value === 'asc'
        ? a.batchName.localeCompare(b.batchName)
        : b.batchName.localeCompare(a.batchName)
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
  dateFrom.value = ''
  dateTo.value = ''
  markedByFilter.value = ''
  quickStatus.value = 'All'

  headerCourseFilter.value = 0
  headerBatchFilter.value = 0
  headerStatusFilter.value = ''

  sortField.value = 'date'
  sortDirection.value = 'desc'
}

function getStatusClass(status: AttendanceStatus) {
  if (status === 'Present') return 'status-present'
  if (status === 'Absent') return 'status-absent'
  if (status === 'Late') return 'status-late'
  return 'status-leave'
}

function goView(id: number) {
  router.push(`/attendance/view/${id}`)
}

function deleteSelectedRecords() {
  if (!selectedIds.value.length) return

  const confirmed = window.confirm(
    `Are you sure you want to delete ${selectedIds.value.length} selected attendance record(s)?`,
  )
  if (!confirmed) return

  const removed = attendanceStore.removeMany(selectedIds.value)
  deletedRecords.value = removed
  showUndo.value = removed.length > 0
  selectedIds.value = []
}

function undoDelete() {
  if (!deletedRecords.value.length) return
  attendanceStore.restoreMany(deletedRecords.value)
  deletedRecords.value = []
  showUndo.value = false
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB')
}

function sanitize(value: string | number) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function getExportRows() {
  return filteredRows.value.map((row) => ({
    ID: row.id,
    Date: row.date,
    Student: row.studentName,
    Course: row.courseName,
    Batch: row.batchName,
    Status: row.status,
    MarkedBy: row.markedBy,
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
      Date: '',
      Student: '',
      Course: '',
      Batch: '',
      Status: '',
      MarkedBy: '',
      Note: '',
    },
  )

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => sanitize(row[header as keyof typeof row])).join(','),
    ),
  ].join('\n')

  downloadFile(csv, 'attendance-export.csv', 'text/csv;charset=utf-8;')
}

function exportJson() {
  const rows = getExportRows()
  downloadFile(JSON.stringify(rows, null, 2), 'attendance-export.json', 'application/json')
}

function printTable() {
  const rows = getExportRows()

  const html = `
    <html>
      <head>
        <title>Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h2 { margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h2>Attendance Report</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Student</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Status</th>
              <th>Marked By</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
              <tr>
                <td>${row.ID}</td>
                <td>${row.Date}</td>
                <td>${row.Student}</td>
                <td>${row.Course}</td>
                <td>${row.Batch}</td>
                <td>${row.Status}</td>
                <td>${row.MarkedBy}</td>
                <td>${row.Note || '-'}</td>
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
.attendance-page {
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

.stat-card-present {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
}

.stat-card-absent {
  background: linear-gradient(135deg, #b91c1c, #ef4444);
}

.stat-card-support {
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
  width: 380px;
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
  min-width: 170px;
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

.attendance-table {
  width: 100%;
  min-width: 1300px;
  border-collapse: collapse;
}

.attendance-table thead th {
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
  min-width: 130px;
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

.attendance-table tbody td {
  padding: 10px 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  white-space: nowrap;
  vertical-align: middle;
  color: #334155;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.98);
}

.attendance-table tbody tr {
  transition: 0.22s ease;
}

.attendance-table tbody tr:nth-child(even) td {
  background: rgba(248, 250, 252, 0.98);
}

.attendance-table tbody tr:hover td {
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

.status-present {
  color: #065f46;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.18);
}

.status-absent {
  color: #991b1b;
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.18);
}

.status-late {
  color: #9a3412;
  background: rgba(249, 115, 22, 0.14);
  border: 1px solid rgba(249, 115, 22, 0.18);
}

.status-leave {
  color: #3730a3;
  background: rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(99, 102, 241, 0.18);
}

.note-cell {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
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
  .attendance-page {
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
