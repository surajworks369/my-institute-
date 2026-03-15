<template>
  <div class="report-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Reports</p>
        <h2>Student Report</h2>
      </div>

      <div class="head-actions">
        <router-link to="/reports" class="app-btn app-btn-secondary app-btn-pill">
          Back to Reports
        </router-link>
      </div>
    </div>

    <section class="stats-grid">
      <div class="stat-card stat-card-total">
        <div class="stat-icon">👨‍🎓</div>
        <div class="stat-content">
          <p>Total Students</p>
          <h3>{{ rows.length }}</h3>
          <small>Filtered student records</small>
        </div>
      </div>

      <div class="stat-card stat-card-active">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <p>Active</p>
          <h3>{{ activeCount }}</h3>
          <small>Currently active students</small>
        </div>
      </div>

      <div class="stat-card stat-card-inactive">
        <div class="stat-icon">⏸️</div>
        <div class="stat-content">
          <p>Inactive</p>
          <h3>{{ inactiveCount }}</h3>
          <small>Inactive student records</small>
        </div>
      </div>

      <div class="stat-card stat-card-courses">
        <div class="stat-icon">📘</div>
        <div class="stat-content">
          <p>Courses</p>
          <h3>{{ totalCourses }}</h3>
          <small>Visible course coverage</small>
        </div>
      </div>
    </section>

    <section class="panel card">
      <div class="section-top">
        <div class="title-block">
          <p class="eyebrow">Student Analytics</p>
          <h2>Students Overview</h2>
        </div>

        <div class="section-actions">
          <div class="search-box">
            <span class="search-icon">🔎</span>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search by student, email, phone, city, course..."
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
            :class="{ active: quickStatus === 'Active' }"
            @click="quickStatus = 'Active'"
          >
            Active
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Inactive' }"
            @click="quickStatus = 'Inactive'"
          >
            Inactive
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
            <span class="meta-chip">{{ rows.length }} records found</span>
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
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>City</th>
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
              <th>Joined</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="displayRows.length === 0">
              <td colspan="10" class="empty-state">No results found for current filters.</td>
            </tr>

            <tr v-for="row in displayRows" :key="row.id">
              <td>#{{ row.studentId }}</td>
              <td>
                <div class="cell-title">
                  <div class="name">{{ row.studentName }}</div>
                </div>
              </td>
              <td>{{ row.courseName }}</td>
              <td>{{ row.batchName }}</td>
              <td>{{ row.email }}</td>
              <td>{{ row.phone }}</td>
              <td>{{ row.gender }}</td>
              <td>{{ row.city }}</td>
              <td>
                <span
                  class="status-pill"
                  :class="row.status === 'Active' ? 'status-active' : 'status-inactive'"
                >
                  {{ row.status }}
                </span>
              </td>
              <td>{{ formatDate(row.joinedDate) }}</td>
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
import type { ReportFilters } from '@/types/report'

const reportStore = useReportStore()

onMounted(() => {
  reportStore.init()
})

const filters = reactive<ReportFilters>({
  search: '',
})

const quickStatus = ref<'All' | 'Active' | 'Inactive'>('All')
const headerCourseId = ref(0)
const headerBatchId = ref(0)
const headerStatus = ref('')

const rows = computed(() => reportStore.filterStudentReports(filters))
const batches = computed(() => reportStore.batches)
const courses = computed(() => reportStore.courses)
const statuses = computed(() => reportStore.studentStatuses)

const displayRows = computed(() => {
  return rows.value.filter((row) => {
    const matchesQuick = quickStatus.value === 'All' || row.status === quickStatus.value
    const matchesHeaderCourse = !headerCourseId.value || row.courseId === headerCourseId.value
    const matchesHeaderBatch = !headerBatchId.value || row.batchId === headerBatchId.value
    const matchesHeaderStatus = !headerStatus.value || row.status === headerStatus.value
    return matchesQuick && matchesHeaderCourse && matchesHeaderBatch && matchesHeaderStatus
  })
})

const activeCount = computed(
  () => displayRows.value.filter((row) => row.status === 'Active').length,
)
const inactiveCount = computed(
  () => displayRows.value.filter((row) => row.status === 'Inactive').length,
)
const totalCourses = computed(() => new Set(displayRows.value.map((row) => row.courseName)).size)

function resetFilters() {
  filters.search = ''
  filters.batchId = undefined
  filters.courseId = undefined
  filters.status = undefined
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

function sanitize(value: string | number) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function getExportRows() {
  return displayRows.value.map((row) => ({
    ID: row.studentId,
    Student: row.studentName,
    Course: row.courseName,
    Batch: row.batchName,
    Email: row.email,
    Phone: row.phone,
    Gender: row.gender,
    City: row.city,
    Status: row.status,
    JoinedDate: row.joinedDate,
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
      Email: '',
      Phone: '',
      Gender: '',
      City: '',
      Status: '',
      JoinedDate: '',
    },
  )

  const csv = [
    headers.join(','),
    ...exportRows.map((row) =>
      headers.map((header) => sanitize(row[header as keyof typeof row])).join(','),
    ),
  ].join('\n')

  downloadFile(csv, 'student-report.csv', 'text/csv;charset=utf-8;')
}

function exportJson() {
  downloadFile(JSON.stringify(getExportRows(), null, 2), 'student-report.json', 'application/json')
}

function printTable() {
  const exportRows = getExportRows()

  const html = `
    <html>
      <head>
        <title>Student Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h2 { margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h2>Student Report</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Gender</th>
              <th>City</th>
              <th>Status</th>
              <th>Joined Date</th>
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
                <td>${row.Email}</td>
                <td>${row.Phone}</td>
                <td>${row.Gender}</td>
                <td>${row.City}</td>
                <td>${row.Status}</td>
                <td>${row.JoinedDate}</td>
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

.stat-card-total {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}
.stat-card-active {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
}
.stat-card-inactive {
  background: linear-gradient(135deg, #c2410c, #f97316);
}
.stat-card-courses {
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
}

.stat-content p {
  font-size: 14px;
  margin-bottom: 6px;
  opacity: 0.92;
}

.stat-content h3 {
  font-size: 30px;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-content small {
  font-size: 12px;
  opacity: 0.86;
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
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.08);
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  font-size: 16px;
  opacity: 0.8;
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
  color: #fff;
  border-color: transparent;
}

.toolbar-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
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
  min-width: 1380px;
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
  white-space: nowrap;
  vertical-align: top;
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
}

.report-table tbody td {
  padding: 10px 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  white-space: nowrap;
  color: #334155;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.98);
}

.report-table tbody tr:nth-child(even) td {
  background: rgba(248, 250, 252, 0.98);
}

.cell-title .name {
  font-weight: 800;
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

.status-active {
  color: #065f46;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.18);
}

.status-inactive {
  color: #9a3412;
  background: rgba(249, 115, 22, 0.14);
  border: 1px solid rgba(249, 115, 22, 0.18);
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
    grid-template-columns: repeat(2, 1fr);
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
