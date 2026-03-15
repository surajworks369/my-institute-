<template>
  <div class="report-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Reports</p>
        <h2>Exam Report</h2>
      </div>

      <div class="head-actions">
        <router-link to="/reports" class="app-btn app-btn-secondary app-btn-pill">
          Back to Reports
        </router-link>
      </div>
    </div>

    <section class="stats-grid">
      <div class="stat-card stat-card-total">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <p>Total Rows</p>
          <h3>{{ displayRows.length }}</h3>
          <small>Filtered exam result rows</small>
        </div>
      </div>

      <div class="stat-card stat-card-pass">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <p>Pass</p>
          <h3>{{ pass }}</h3>
          <small>Passed result rows</small>
        </div>
      </div>

      <div class="stat-card stat-card-fail">
        <div class="stat-icon">❌</div>
        <div class="stat-content">
          <p>Fail</p>
          <h3>{{ fail }}</h3>
          <small>Failed result rows</small>
        </div>
      </div>

      <div class="stat-card stat-card-avg">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <p>Average Marks</p>
          <h3>{{ avgMarks }}</h3>
          <small>Average obtained marks</small>
        </div>
      </div>
    </section>

    <section class="panel card">
      <div class="section-top">
        <div class="title-block">
          <p class="eyebrow">Exam Analytics</p>
          <h2>Exam Overview</h2>
        </div>

        <div class="section-actions">
          <div class="search-box">
            <span class="search-icon">🔎</span>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Search by exam, student, result, checker..."
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
            :class="{ active: quickStatus === 'Pass' }"
            @click="quickStatus = 'Pass'"
          >
            Pass
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Fail' }"
            @click="quickStatus = 'Fail'"
          >
            Fail
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
            <label>Exam</label>
            <select v-model.number="filters.examId">
              <option :value="undefined">All Exams</option>
              <option v-for="exam in exams" :key="exam.id" :value="exam.id">
                {{ exam.name }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Result</label>
            <select v-model="filters.status">
              <option :value="undefined">All Result</option>
              <option v-for="status in statuses" :key="status" :value="status">
                {{ status }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Checked By</label>
            <input v-model="filters.checkedBy" type="text" placeholder="Admin / Exam Dept" />
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
              <th>Exam</th>
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
              <th>Marks</th>
              <th>Percentage</th>
              <th>
                <div class="th-filter-box">
                  <span>Result</span>
                  <select v-model="headerStatus" @click.stop>
                    <option value="">All</option>
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>
              </th>
              <th>Checked By</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="displayRows.length === 0">
              <td colspan="9" class="empty-state">No exam records found.</td>
            </tr>

            <tr v-for="row in displayRows" :key="row.id">
              <td>{{ row.examName }}</td>
              <td>
                <div class="cell-title">
                  <div class="name">{{ row.studentName }}</div>
                </div>
              </td>
              <td>{{ row.courseName }}</td>
              <td>{{ row.batchName }}</td>
              <td>{{ row.obtainedMarks }} / {{ row.totalMarks }}</td>
              <td>{{ row.percentage }}%</td>
              <td>
                <span
                  class="status-pill"
                  :class="row.result === 'Pass' ? 'status-pass' : 'status-fail'"
                >
                  {{ row.result }}
                </span>
              </td>
              <td>{{ row.checkedBy }}</td>
              <td>{{ formatDate(row.examDate) }}</td>
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
  checkedBy: '',
})

const quickStatus = ref<'All' | 'Pass' | 'Fail'>('All')
const headerCourseId = ref(0)
const headerBatchId = ref(0)
const headerStatus = ref('')

const rows = computed(() => reportStore.filterExamReports(filters))
const batches = computed(() => reportStore.batches)
const courses = computed(() => reportStore.courses)
const exams = computed(() => reportStore.exams)
const statuses = computed(() => reportStore.examStatuses)

const displayRows = computed(() =>
  rows.value.filter((row) => {
    const matchesQuick = quickStatus.value === 'All' || row.result === quickStatus.value
    const matchesHeaderCourse = !headerCourseId.value || row.courseId === headerCourseId.value
    const matchesHeaderBatch = !headerBatchId.value || row.batchId === headerBatchId.value
    const matchesHeaderStatus = !headerStatus.value || row.result === headerStatus.value
    return matchesQuick && matchesHeaderCourse && matchesHeaderBatch && matchesHeaderStatus
  }),
)

const pass = computed(() => displayRows.value.filter((r) => r.result === 'Pass').length)
const fail = computed(() => displayRows.value.filter((r) => r.result === 'Fail').length)
const avgMarks = computed(() => {
  if (!displayRows.value.length) return 0
  return Math.round(
    displayRows.value.reduce((sum, row) => sum + row.obtainedMarks, 0) / displayRows.value.length,
  )
})

function resetFilters() {
  filters.search = ''
  filters.batchId = undefined
  filters.courseId = undefined
  filters.examId = undefined
  filters.status = undefined
  filters.checkedBy = ''
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
    Exam: row.examName,
    Student: row.studentName,
    Course: row.courseName,
    Batch: row.batchName,
    ObtainedMarks: row.obtainedMarks,
    TotalMarks: row.totalMarks,
    Percentage: row.percentage,
    Result: row.result,
    CheckedBy: row.checkedBy,
    ExamDate: row.examDate,
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
      Exam: '',
      Student: '',
      Course: '',
      Batch: '',
      ObtainedMarks: '',
      TotalMarks: '',
      Percentage: '',
      Result: '',
      CheckedBy: '',
      ExamDate: '',
    },
  )

  const csv = [
    headers.join(','),
    ...exportRows.map((row) =>
      headers.map((header) => sanitize(row[header as keyof typeof row])).join(','),
    ),
  ].join('\n')

  downloadFile(csv, 'exam-report.csv', 'text/csv;charset=utf-8;')
}

function exportJson() {
  downloadFile(JSON.stringify(getExportRows(), null, 2), 'exam-report.json', 'application/json')
}

function printTable() {
  const exportRows = getExportRows()
  const html = `
    <html>
      <head>
        <title>Exam Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h2 { margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h2>Exam Report</h2>
        <table>
          <thead>
            <tr>
              <th>Exam</th>
              <th>Student</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Obtained Marks</th>
              <th>Total Marks</th>
              <th>Percentage</th>
              <th>Result</th>
              <th>Checked By</th>
              <th>Exam Date</th>
            </tr>
          </thead>
          <tbody>
            ${exportRows
              .map(
                (row) => `
              <tr>
                <td>${row.Exam}</td>
                <td>${row.Student}</td>
                <td>${row.Course}</td>
                <td>${row.Batch}</td>
                <td>${row.ObtainedMarks}</td>
                <td>${row.TotalMarks}</td>
                <td>${row.Percentage}%</td>
                <td>${row.Result}</td>
                <td>${row.CheckedBy}</td>
                <td>${row.ExamDate}</td>
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
.stat-card-pass {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
}
.stat-card-fail {
  background: linear-gradient(135deg, #b91c1c, #ef4444);
}
.stat-card-avg {
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
  grid-template-columns: repeat(7, minmax(0, 1fr));
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
  min-width: 1400px;
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

.status-pass {
  color: #065f46;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.18);
}

.status-fail {
  color: #991b1b;
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.18);
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
