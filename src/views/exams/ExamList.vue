<template>
  <div class="exam-page fade-in">
    <section class="stats-grid">
      <div class="stat-card stat-card-total">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <p>Total Exams</p>
          <h3>{{ totalExams }}</h3>
          <small>Exam records in system</small>
        </div>
      </div>

      <div class="stat-card stat-card-upcoming">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <p>Upcoming</p>
          <h3>{{ upcomingCount }}</h3>
          <small>Scheduled upcoming exams</small>
        </div>
      </div>

      <div class="stat-card stat-card-ongoing">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <p>Ongoing</p>
          <h3>{{ ongoingCount }}</h3>
          <small>Currently active exams</small>
        </div>
      </div>

      <div class="stat-card stat-card-completed">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <p>Completed</p>
          <h3>{{ completedCount }}</h3>
          <small>Finished exam sessions</small>
        </div>
      </div>
    </section>

    <section class="panel card">
      <div class="section-top">
        <div class="title-block">
          <p class="eyebrow">Academic Management</p>
          <h2>Exam List</h2>
        </div>

        <div class="section-actions">
          <div class="search-box">
            <span class="search-icon">🔎</span>
            <input
              v-model="globalSearch"
              type="text"
              placeholder="Search by exam, code, type, status..."
            />
          </div>

          <router-link class="app-btn app-btn-primary app-btn-pill top-add-btn" to="/exams/add">
            + Add Exam
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
            :class="{ active: quickStatus === 'Upcoming' }"
            @click="setQuickStatus('Upcoming')"
          >
            Upcoming
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Ongoing' }"
            @click="setQuickStatus('Ongoing')"
          >
            Ongoing
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Completed' }"
            @click="setQuickStatus('Completed')"
          >
            Completed
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Cancelled' }"
            @click="setQuickStatus('Cancelled')"
          >
            Cancelled
          </button>
        </div>

        <div class="toolbar-grid">
          <div class="toolbar-field">
            <label>Course</label>
            <select v-model.number="courseFilter">
              <option :value="0">All Courses</option>
              <option v-for="course in courses" :key="course.id" :value="course.id">
                {{ course.name }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Batch</label>
            <select v-model.number="batchFilter">
              <option :value="0">All Batches</option>
              <option v-for="batch in filteredBatches" :key="batch.id" :value="batch.id">
                {{ batch.name }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Type</label>
            <select v-model="typeFilter">
              <option value="">All Types</option>
              <option v-for="type in examTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Status</label>
            <select v-model="statusFilter">
              <option value="">All Status</option>
              <option v-for="status in examStatuses" :key="status" :value="status">
                {{ status }}
              </option>
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
        </div>
      </div>

      <div class="table-meta">
        <div class="table-meta-left">
          <span class="meta-chip">{{ filteredExams.length }} records found</span>
          <span class="meta-chip soft-chip">{{ totalMarksEntries }} marks entries</span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="exams-table">
          <thead>
            <tr>
              <th @click="setSort('id')" class="sortable-th">
                <div class="th-content">
                  <span>ID</span>
                  <span class="sort-indicator">{{ getSortIndicator('id') }}</span>
                </div>
              </th>

              <th @click="setSort('name')" class="sortable-th">
                <div class="th-content">
                  <span>Exam</span>
                  <span class="sort-indicator">{{ getSortIndicator('name') }}</span>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Course</span>
                  <select v-model.number="headerCourseFilter" @click.stop>
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
                  <select v-model.number="headerBatchFilter" @click.stop>
                    <option :value="0">All</option>
                    <option v-for="batch in filteredBatches" :key="batch.id" :value="batch.id">
                      {{ batch.name }}
                    </option>
                  </select>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Type</span>
                  <select v-model="headerTypeFilter" @click.stop>
                    <option value="">All</option>
                    <option v-for="type in examTypes" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                </div>
              </th>

              <th @click="setSort('examDate')" class="sortable-th">
                <div class="th-content">
                  <span>Date</span>
                  <span class="sort-indicator">{{ getSortIndicator('examDate') }}</span>
                </div>
              </th>

              <th>Time</th>

              <th @click="setSort('totalMarks')" class="sortable-th">
                <div class="th-content">
                  <span>Marks</span>
                  <span class="sort-indicator">{{ getSortIndicator('totalMarks') }}</span>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Status</span>
                  <select v-model="headerStatusFilter" @click.stop>
                    <option value="">All</option>
                    <option v-for="status in examStatuses" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>
              </th>

              <th>Entries</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredExams.length === 0">
              <td colspan="10" class="empty-state">No exams found for current filters.</td>
            </tr>

            <tr v-for="exam in filteredExams" :key="exam.id">
              <td>#{{ exam.id }}</td>

              <td>
                <button class="exam-link" @click="goView(exam.id)">
                  <span class="exam-link-name">{{ exam.name }}</span>
                  <span class="exam-link-meta">{{ exam.code }} • View details ↗</span>
                </button>
              </td>

              <td>{{ courseName(exam.courseId) }}</td>
              <td>{{ batchName(exam.batchId) }}</td>
              <td>{{ exam.type }}</td>
              <td>{{ formatDate(exam.examDate) }}</td>
              <td>{{ exam.startTime }} - {{ exam.endTime }}</td>
              <td>{{ exam.passingMarks }}/{{ exam.totalMarks }}</td>

              <td>
                <span class="status-pill" :class="getStatusClass(exam.status)">
                  {{ exam.status }}
                </span>
              </td>

              <td>
                <div class="action-cell">
                  <span class="entry-chip">{{ marksCount(exam.id) }} entries</span>
                  <div class="mini-actions">
                    <button class="table-link" @click="goEdit(exam.id)">Edit</button>
                    <span class="sep">|</span>
                    <button class="table-link danger-link" @click="deleteExam(exam.id)">
                      Delete
                    </button>
                  </div>
                </div>
              </td>
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
import { useExamStore } from '@/stores/examStore'
import { useBatchesStore } from '@/stores/batchesStore'
import { useCourseStore } from '@/stores/courseStore'
import { EXAM_STATUSES, EXAM_TYPES, type ExamStatus, type ExamType } from '@/types/exam'

type SortField = 'id' | 'name' | 'examDate' | 'totalMarks'
type SortDirection = 'asc' | 'desc'
type QuickStatus = 'All' | ExamStatus

const router = useRouter()
const examStore = useExamStore()
const batchStore = useBatchesStore()
const courseStore = useCourseStore()

const globalSearch = ref('')
const courseFilter = ref(0)
const batchFilter = ref(0)
const typeFilter = ref<'' | ExamType>('')
const statusFilter = ref<'' | ExamStatus>('')
const dateFrom = ref('')
const dateTo = ref('')
const quickStatus = ref<QuickStatus>('All')

const headerCourseFilter = ref(0)
const headerBatchFilter = ref(0)
const headerTypeFilter = ref<'' | ExamType>('')
const headerStatusFilter = ref<'' | ExamStatus>('')

const sortField = ref<SortField>('examDate')
const sortDirection = ref<SortDirection>('desc')

onMounted(() => {
  batchStore.init()
  courseStore.init()
  examStore.init()
})

watch(courseFilter, (value) => {
  if (!value) return
  const batch = batchStore.getById(batchFilter.value)
  if (batch && batch.courseId !== value) batchFilter.value = 0
})

watch(headerCourseFilter, (value) => {
  if (!value) return
  const batch = batchStore.getById(headerBatchFilter.value)
  if (batch && batch.courseId !== value) headerBatchFilter.value = 0
})

const courses = computed(() => [...courseStore.courses])
const examTypes = EXAM_TYPES
const examStatuses = EXAM_STATUSES

const filteredBatches = computed(() => {
  const ids = new Set<number>()
  if (courseFilter.value) ids.add(courseFilter.value)
  if (headerCourseFilter.value) ids.add(headerCourseFilter.value)

  if (!ids.size) return [...batchStore.batches]
  return batchStore.batches.filter((batch) => ids.has(batch.courseId))
})

const totalExams = computed(() => examStore.totalExams)
const upcomingCount = computed(() => examStore.upcomingCount)
const ongoingCount = computed(() => examStore.ongoingCount)
const completedCount = computed(() => examStore.completedCount)
const totalMarksEntries = computed(() => examStore.totalMarksEntries)

const filteredExams = computed(() => {
  const query = globalSearch.value.trim().toLowerCase()

  const rows = [...examStore.exams].filter((exam) => {
    const matchesGlobal =
      !query ||
      exam.name.toLowerCase().includes(query) ||
      exam.code.toLowerCase().includes(query) ||
      exam.type.toLowerCase().includes(query) ||
      exam.status.toLowerCase().includes(query)

    const matchesCourse = !courseFilter.value || exam.courseId === courseFilter.value
    const matchesBatch = !batchFilter.value || exam.batchId === batchFilter.value
    const matchesType = !typeFilter.value || exam.type === typeFilter.value
    const matchesStatus = !statusFilter.value || exam.status === statusFilter.value
    const matchesQuickStatus = quickStatus.value === 'All' || exam.status === quickStatus.value
    const matchesDateFrom = !dateFrom.value || exam.examDate >= dateFrom.value
    const matchesDateTo = !dateTo.value || exam.examDate <= dateTo.value

    const matchesHeaderCourse =
      !headerCourseFilter.value || exam.courseId === headerCourseFilter.value
    const matchesHeaderBatch = !headerBatchFilter.value || exam.batchId === headerBatchFilter.value
    const matchesHeaderType = !headerTypeFilter.value || exam.type === headerTypeFilter.value
    const matchesHeaderStatus =
      !headerStatusFilter.value || exam.status === headerStatusFilter.value

    return (
      matchesGlobal &&
      matchesCourse &&
      matchesBatch &&
      matchesType &&
      matchesStatus &&
      matchesQuickStatus &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesHeaderCourse &&
      matchesHeaderBatch &&
      matchesHeaderType &&
      matchesHeaderStatus
    )
  })

  rows.sort((a, b) => {
    if (sortField.value === 'id') {
      return sortDirection.value === 'asc' ? a.id - b.id : b.id - a.id
    }
    if (sortField.value === 'name') {
      return sortDirection.value === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    }
    if (sortField.value === 'examDate') {
      return sortDirection.value === 'asc'
        ? a.examDate.localeCompare(b.examDate)
        : b.examDate.localeCompare(a.examDate)
    }
    if (sortField.value === 'totalMarks') {
      return sortDirection.value === 'asc'
        ? a.totalMarks - b.totalMarks
        : b.totalMarks - a.totalMarks
    }
    return 0
  })

  return rows
})

function setQuickStatus(status: QuickStatus) {
  quickStatus.value = status
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
  typeFilter.value = ''
  statusFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  quickStatus.value = 'All'
  headerCourseFilter.value = 0
  headerBatchFilter.value = 0
  headerTypeFilter.value = ''
  headerStatusFilter.value = ''
  sortField.value = 'examDate'
  sortDirection.value = 'desc'
}

function courseName(id: number) {
  return courseStore.getCourseById(id)?.name ?? `Course ${id}`
}

function batchName(id: number) {
  return batchStore.getById(id)?.name ?? `Batch ${id}`
}

function marksCount(examId: number) {
  return examStore.marksByExam(examId).length
}

function getStatusClass(status: ExamStatus) {
  if (status === 'Upcoming') return 'status-upcoming'
  if (status === 'Ongoing') return 'status-ongoing'
  if (status === 'Completed') return 'status-completed'
  return 'status-cancelled'
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB')
}

function goView(id: number) {
  router.push(`/exams/view/${id}`)
}

function goEdit(id: number) {
  router.push(`/exams/edit/${id}`)
}

function deleteExam(id: number) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this exam? Related marks will also be deleted.',
  )
  if (!confirmed) return
  examStore.removeExam(id)
}

function sanitize(value: string | number) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function getExportRows() {
  return filteredExams.value.map((exam) => ({
    ID: exam.id,
    Name: exam.name,
    Code: exam.code,
    Course: courseName(exam.courseId),
    Batch: batchName(exam.batchId),
    Type: exam.type,
    Status: exam.status,
    ExamDate: exam.examDate,
    StartTime: exam.startTime,
    EndTime: exam.endTime,
    PassingMarks: exam.passingMarks,
    TotalMarks: exam.totalMarks,
    Entries: marksCount(exam.id),
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
      Name: '',
      Code: '',
      Course: '',
      Batch: '',
      Type: '',
      Status: '',
      ExamDate: '',
      StartTime: '',
      EndTime: '',
      PassingMarks: '',
      TotalMarks: '',
      Entries: '',
    },
  )

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => sanitize(row[header as keyof typeof row])).join(','),
    ),
  ].join('\n')

  downloadFile(csv, 'exams-export.csv', 'text/csv;charset=utf-8;')
}

function exportJson() {
  downloadFile(JSON.stringify(getExportRows(), null, 2), 'exams-export.json', 'application/json')
}

function printTable() {
  const rows = getExportRows()

  const html = `
    <html>
      <head>
        <title>Exams Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h2 { margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h2>Exams Report</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Type</th>
              <th>Status</th>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
              <th>Passing</th>
              <th>Total</th>
              <th>Entries</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
              <tr>
                <td>${row.ID}</td>
                <td>${row.Name}</td>
                <td>${row.Code}</td>
                <td>${row.Course}</td>
                <td>${row.Batch}</td>
                <td>${row.Type}</td>
                <td>${row.Status}</td>
                <td>${row.ExamDate}</td>
                <td>${row.StartTime}</td>
                <td>${row.EndTime}</td>
                <td>${row.PassingMarks}</td>
                <td>${row.TotalMarks}</td>
                <td>${row.Entries}</td>
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
.exam-page {
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
.stat-card-upcoming {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
}
.stat-card-ongoing {
  background: linear-gradient(135deg, #c2410c, #f97316);
}
.stat-card-completed {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
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
  min-width: 155px;
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

.toolbar-actions-left {
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

.exams-table {
  width: 100%;
  min-width: 1400px;
  border-collapse: collapse;
}

.exams-table thead th {
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

.exams-table tbody td {
  padding: 10px 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  white-space: nowrap;
  vertical-align: middle;
  color: #334155;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.98);
}

.exams-table tbody tr:nth-child(even) td {
  background: rgba(248, 250, 252, 0.98);
}

.exams-table tbody tr:hover td {
  background: rgba(79, 70, 229, 0.05);
}

.exam-link {
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

.exam-link-name {
  color: var(--primary);
  font-weight: 800;
  font-size: 14px;
  line-height: 1.2;
}

.exam-link-meta {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
  opacity: 0.95;
}

.exam-link:hover .exam-link-name {
  text-decoration: underline;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 90px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.status-upcoming {
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.14);
  border: 1px solid rgba(59, 130, 246, 0.18);
}
.status-ongoing {
  color: #9a3412;
  background: rgba(249, 115, 22, 0.14);
  border: 1px solid rgba(249, 115, 22, 0.18);
}
.status-completed {
  color: #065f46;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.18);
}
.status-cancelled {
  color: #991b1b;
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.18);
}

.entry-chip {
  display: inline-flex;
  min-height: 32px;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.1);
  color: #4338ca;
  font-size: 12px;
  font-weight: 800;
}

.action-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mini-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.table-link {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--primary);
  font-weight: 700;
}

.table-link:hover {
  text-decoration: underline;
}

.danger-link {
  color: #dc2626;
}

.sep {
  color: #cbd5e1;
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
}

@media (max-width: 900px) {
  .toolbar-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .exam-page {
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

  .toolbar-actions-left > * {
    flex: 1 1 100%;
  }

  .top-add-btn {
    width: 100%;
  }
}
</style>
