<template>
  <div class="report-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Reports</p>
        <h2>Attendance Report</h2>
      </div>

      <div class="head-actions">
        <router-link to="/reports" class="app-btn app-btn-secondary app-btn-pill">
          Back to Reports
        </router-link>
      </div>
    </div>

    <section class="stats-grid">
      <div class="stat-card stat-card-present">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <p>Present</p>
          <h3>{{ present }}</h3>
          <small>Present attendance rows</small>
        </div>
      </div>

      <div class="stat-card stat-card-absent">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <p>Absent</p>
          <h3>{{ absent }}</h3>
          <small>Absent attendance rows</small>
        </div>
      </div>

      <div class="stat-card stat-card-late">
        <div class="stat-icon">⏰</div>
        <div class="stat-content">
          <p>Late</p>
          <h3>{{ late }}</h3>
          <small>Late attendance rows</small>
        </div>
      </div>

      <div class="stat-card stat-card-leave">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <p>Leave</p>
          <h3>{{ leave }}</h3>
          <small>Leave attendance rows</small>
        </div>
      </div>
    </section>

    <section class="panel card">
      <div class="section-top">
        <div class="title-block">
          <p class="eyebrow">Attendance Analytics</p>
          <h2>Attendance Overview</h2>
        </div>

        <div class="section-actions">
          <div class="search-box">
            <span class="search-icon">🔎</span>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search by student, batch, course, note..."
            />
          </div>
        </div>
      </div>

      <div class="toolbar">
        <div class="quick-tabs">
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'All' }"
            @click="quickStatus = 'All'"
          >
            All
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Present' }"
            @click="quickStatus = 'Present'"
          >
            Present
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Absent' }"
            @click="quickStatus = 'Absent'"
          >
            Absent
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Late' }"
            @click="quickStatus = 'Late'"
          >
            Late
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Leave' }"
            @click="quickStatus = 'Leave'"
          >
            Leave
          </button>
        </div>

        <div class="toolbar-grid">
          <div class="toolbar-field">
            <label>Course</label>
            <select v-model.number="filters.courseId">
              <option :value="undefined">All Courses</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.name }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Batch</label>
            <select v-model.number="filters.batchId">
              <option :value="undefined">All Batches</option>
              <option v-for="batch in batches" :key="batch.id" :value="batch.id">
                {{ batch.name }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Status</label>
            <select v-model="filters.status">
              <option :value="undefined">All Status</option>
              <option v-for="status in statuses" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Marked By</label>
            <input v-model="filters.markedBy" type="text" placeholder="Admin / Staff" />
          </div>

          <div class="toolbar-field">
            <label>From Date</label>
            <input type="date" v-model="filters.fromDate" />
          </div>

          <div class="toolbar-field">
            <label>To Date</label>
            <input type="date" v-model="filters.toDate" />
          </div>
        </div>

        <div class="toolbar-actions">
          <div class="toolbar-actions-left">
            <button class="app-btn app-btn-secondary compact-btn" @click="resetFilters">
              Reset
            </button>
            <button class="app-btn app-btn-secondary compact-btn" @click="exportCsv">CSV</button>
            <button class="app-btn app-btn-secondary compact-btn" @click="exportJson">JSON</button>
            <button class="app-btn app-btn-secondary compact-btn" @click="printTable">
              Print / PDF
            </button>
          </div>

          <div class="toolbar-actions-right">
            <span class="meta-chip">{{ displayRows.length }} records found</span>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="report-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>
                <div class="th-filter-box">
                  <span>Course</span>
                  <select v-model.number="headerCourseId" @click.stop>
                    <option :value="0">All</option>
                    <option v-for="course in courses" :key="course.id" :value="course.id">
                      {{ course.name }}
                    </option>
                  </select>
                </div>
              </th>
              <th>
                <div class="th-filter-box">
                  <span>Batch</span>
                  <select v-model.number="headerBatchId" @click.stop>
                    <option :value="0">All</option>
                    <option v-for="batch in batches" :key="batch.id" :value="batch.id">
                      {{ batch.name }}
                    </option>
                  </select>
                </div>
              </th>
              <th>Date</th>
              <th>
                <div class="th-filter-box">
                  <span>Status</span>
                  <select v-model="headerStatus" @click.stop>
                    <option value="">All</option>
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>
              </th>
              <th>Marked By</th>
              <th>Note</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="displayRows.length === 0">
              <td colspan="8" class="empty-state">No attendance records found.</td>
            </tr>

            <tr v-for="row in displayRows" :key="row.id">
              <td>#{{ row.id }}</td>
              <td>
                <div class="cell-title">
                  <div class="name">{{ row.studentName }}</div>
                </div>
              </td>
              <td>{{ row.courseName }}</td>
              <td>{{ row.batchName }}</td>
              <td>{{ formatDate(row.date) }}</td>
              <td>
                <span class="status-pill" :class="getStatusClass(row.status)">
                  {{ row.status }}
                </span>
              </td>
              <td>{{ row.markedBy }}</td>
              <td class="note-cell">{{ row.note || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useReportStore } from '@/stores/reportStore'
import type { AttendanceStatus, ReportFilters } from '@/types/report'

const reportStore = useReportStore()

onMounted(() => {
  reportStore.init()
})

const filters = reactive<ReportFilters>({
  search: '',
  markedBy: '',
})

const quickStatus = ref<'All' | AttendanceStatus>('All')
const headerCourseId = ref(0)
const headerBatchId = ref(0)
const headerStatus = ref('')

const rows = computed(() => reportStore.filterAttendanceReports(filters))
const batches = computed(() => reportStore.batches)
const courses = computed(() => reportStore.courses)
const statuses = computed(() => reportStore.attendanceStatuses)

const displayRows = computed(() =>
  rows.value.filter((row) => {
    const matchesQuick = quickStatus.value === 'All' || row.status === quickStatus.value
    const matchesHeaderCourse = !headerCourseId.value || row.courseId === headerCourseId.value
    const matchesHeaderBatch = !headerBatchId.value || row.batchId === headerBatchId.value
    const matchesHeaderStatus = !headerStatus.value || row.status === headerStatus.value
    return matchesQuick && matchesHeaderCourse && matchesHeaderBatch && matchesHeaderStatus
  }),
)

const present = computed(() => displayRows.value.filter((r) => r.status === 'Present').length)
const absent = computed(() => displayRows.value.filter((r) => r.status === 'Absent').length)
const late = computed(() => displayRows.value.filter((r) => r.status === 'Late').length)
const leave = computed(() => displayRows.value.filter((r) => r.status === 'Leave').length)

function resetFilters() {
  filters.search = ''
  filters.batchId = undefined
  filters.courseId = undefined
  filters.status = undefined
  filters.markedBy = ''
  filters.fromDate = ''
  filters.toDate = ''
  quickStatus.value = 'All'
  headerCourseId.value = 0
  headerBatchId.value = 0
  headerStatus.value = ''
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB')
}

function getStatusClass(status: AttendanceStatus) {
  if (status === 'Present') return 'status-present'
  if (status === 'Absent') return 'status-absent'
  if (status === 'Late') return 'status-late'
  return 'status-leave'
}

function sanitize(value: string | number) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function getExportRows() {
  return displayRows.value.map((row) => ({
    ID: row.id,
    Student: row.studentName,
    Course: row.courseName,
    Batch: row.batchName,
    Date: row.date,
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
  const exportRows = getExportRows()
  const headers = Object.keys(
    exportRows[0] ?? {
      ID: '',
      Student: '',
      Course: '',
      Batch: '',
      Date: '',
      Status: '',
      MarkedBy: '',
      Note: '',
    },
  )

  const csv = [
    headers.join(','),
    ...exportRows.map((row) =>
      headers.map((header) => sanitize(row[header as keyof typeof row])).join(','),
    ),
  ].join('\n')

  downloadFile(csv, 'attendance-report.csv', 'text/csv;charset=utf-8;')
}

function exportJson() {
  downloadFile(
    JSON.stringify(getExportRows(), null, 2),
    'attendance-report.json',
    'application/json',
  )
}

function printTable() {
  const exportRows = getExportRows()
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
              <th>Student</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Date</th>
              <th>Status</th>
              <th>Marked By</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${exportRows
              .map(
                (row) => `
              <tr>
                <td>${row.ID}</td>
                <td>${row.Student}</td>
                <td>${row.Course}</td>
                <td>${row.Batch}</td>
                <td>${row.Date}</td>
                <td>${row.Status}</td>
                <td>${row.MarkedBy}</td>
                <td>${row.Note || ''}</td>
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
.report-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 20px;
  min-height: 130px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
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

.stat-card-present {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
}
.stat-card-absent {
  background: linear-gradient(135deg, #b91c1c, #ef4444);
}
.stat-card-late {
  background: linear-gradient(135deg, #b45309, #f59e0b);
}
.stat-card-leave {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
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
}

.stat-content p {
  font-size: 14px;
  margin-bottom: 6px;
}

.stat-content h3 {
  font-size: 30px;
  margin-bottom: 8px;
}

.stat-content small {
  font-size: 12px;
  opacity: 0.88;
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

.section-top h2 {
  font-size: 28px;
  font-weight: 800;
}

.section-actions {
  display: flex;
  align-items: center;
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
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
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
}

.quick-tab.active {
  background: linear-gradient(135deg, #4f46e5, #2563eb);
  color: white;
  border-color: transparent;
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
}

.toolbar-field select,
.toolbar-field input {
  min-height: 44px;
  background: #fff;
  border: 1px solid #dbe3f3;
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

.table-wrapper {
  width: 100%;
  overflow: auto;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.92);
}

.report-table {
  width: 100%;
  min-width: 1320px;
  border-collapse: collapse;
}

.report-table thead th {
  position: sticky;
  top: 0;
  z-index: 3;
  background: linear-gradient(180deg, #eff4ff, #e9eefc);
  color: #1e293b;
  font-size: 13px;
  font-weight: 800;
  padding: 12px 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  vertical-align: top;
}

.th-filter-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
}

.th-filter-box select {
  min-height: 34px;
  padding: 6px 8px;
  font-size: 12px;
  border-radius: 8px;
}

.report-table tbody td {
  padding: 10px 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  white-space: nowrap;
  color: #334155;
  font-size: 14px;
}

.report-table tbody tr:nth-child(even) td {
  background: rgba(248, 250, 252, 0.98);
}

.cell-title .name {
  font-weight: 800;
}

.note-cell {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
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
  color: #92400e;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.18);
}

.status-leave {
  color: #3730a3;
  background: rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(99, 102, 241, 0.18);
}

.empty-state {
  text-align: center;
  padding: 28px 16px !important;
  font-weight: 600;
  color: #64748b;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .toolbar-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .section-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-actions {
    width: 100%;
    margin-left: 0;
  }

  .search-box {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .stats-grid,
  .toolbar-grid {
    grid-template-columns: 1fr;
  }

  .page-head h2,
  .section-top h2 {
    font-size: 24px;
  }

  .panel {
    padding: 16px;
  }
}
</style>
