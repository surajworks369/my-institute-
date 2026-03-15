<template>
  <div class="course-page fade-in">
    <section class="stats-grid">
      <div class="stat-card stat-card-total">
        <div class="stat-icon">📘</div>
        <div class="stat-content">
          <p>Total Courses</p>
          <h3>{{ totalCourses }}</h3>
          <small>Available course profiles</small>
        </div>
      </div>

      <div class="stat-card stat-card-active">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <p>Active Courses</p>
          <h3>{{ activeCount }}</h3>
          <small>Currently open courses</small>
        </div>
      </div>

      <div class="stat-card stat-card-inactive">
        <div class="stat-icon">⏸️</div>
        <div class="stat-content">
          <p>Inactive Courses</p>
          <h3>{{ inactiveCount }}</h3>
          <small>Paused / inactive courses</small>
        </div>
      </div>

      <div class="stat-card stat-card-students">
        <div class="stat-icon">👨‍🎓</div>
        <div class="stat-content">
          <p>Enrolled Students</p>
          <h3>{{ totalEnrolled }}</h3>
          <small>Mapped from course records</small>
        </div>
      </div>
    </section>

    <section class="panel card">
      <div class="section-top">
        <div class="title-block">
          <p class="eyebrow">Course Management</p>
          <h2>Course List</h2>
        </div>

        <div class="section-actions">
          <div class="search-box">
            <span class="search-icon">🔎</span>
            <input
              v-model="globalSearch"
              type="text"
              placeholder="Search by name, code, trainer, batch, duration..."
            />
          </div>

          <router-link class="app-btn app-btn-primary app-btn-pill top-add-btn" to="/courses/add">
            + Add Course
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
            :class="{ active: quickStatus === 'Active' }"
            @click="setQuickStatus('Active')"
          >
            Active
          </button>
          <button
            class="quick-tab"
            :class="{ active: quickStatus === 'Inactive' }"
            @click="setQuickStatus('Inactive')"
          >
            Inactive
          </button>
        </div>

        <div class="toolbar-grid">
          <div class="toolbar-field">
            <label>Duration</label>
            <select v-model="durationFilter">
              <option value="">All Durations</option>
              <option v-for="duration in durationOptionsList" :key="duration" :value="duration">
                {{ duration }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Status</label>
            <select v-model="statusFilter">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Batch</label>
            <select v-model="batchFilter">
              <option value="">All Batches</option>
              <option v-for="batch in batchOptionsList" :key="batch" :value="batch">
                {{ batch }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Trainer</label>
            <select v-model="trainerFilter">
              <option value="">All Trainers</option>
              <option v-for="trainer in trainerOptionsList" :key="trainer" :value="trainer">
                {{ trainer }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Start From</label>
            <input v-model="dateFrom" type="date" />
          </div>

          <div class="toolbar-field">
            <label>Start To</label>
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
              @click="deleteSelectedCourses"
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
          <span class="meta-chip soft-chip">{{ filteredCourses.length }} records found</span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="courses-table">
          <thead>
            <tr>
              <th class="checkbox-col sticky-left">
                <input
                  type="checkbox"
                  :checked="isAllVisibleSelected"
                  @change="toggleSelectAllVisible"
                  aria-label="Select all visible courses"
                />
              </th>

              <th @click="setSort('id')" class="sortable-th">
                <div class="th-content">
                  <span>ID</span>
                  <span class="sort-indicator">{{ getSortIndicator('id') }}</span>
                </div>
              </th>

              <th @click="setSort('name')" class="sortable-th">
                <div class="th-content">
                  <span>Name</span>
                  <span class="sort-indicator">{{ getSortIndicator('name') }}</span>
                </div>
              </th>

              <th @click="setSort('code')" class="sortable-th">
                <div class="th-content">
                  <span>Code</span>
                  <span class="sort-indicator">{{ getSortIndicator('code') }}</span>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Duration</span>
                  <select v-model="headerDurationFilter" @click.stop>
                    <option value="">All</option>
                    <option
                      v-for="duration in durationOptionsList"
                      :key="duration"
                      :value="duration"
                    >
                      {{ duration }}
                    </option>
                  </select>
                </div>
              </th>

              <th @click="setSort('fees')" class="sortable-th">
                <div class="th-content">
                  <span>Fees</span>
                  <span class="sort-indicator">{{ getSortIndicator('fees') }}</span>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Batch</span>
                  <select v-model="headerBatchFilter" @click.stop>
                    <option value="">All</option>
                    <option v-for="batch in batchOptionsList" :key="batch" :value="batch">
                      {{ batch }}
                    </option>
                  </select>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Trainer</span>
                  <select v-model="headerTrainerFilter" @click.stop>
                    <option value="">All</option>
                    <option v-for="trainer in trainerOptionsList" :key="trainer" :value="trainer">
                      {{ trainer }}
                    </option>
                  </select>
                </div>
              </th>

              <th>Assistant Trainer</th>

              <th @click="setSort('startDate')" class="sortable-th">
                <div class="th-content">
                  <span>Start Date</span>
                  <span class="sort-indicator">{{ getSortIndicator('startDate') }}</span>
                </div>
              </th>

              <th>End Date</th>

              <th @click="setSort('enrolledStudents')" class="sortable-th">
                <div class="th-content">
                  <span>Students</span>
                  <span class="sort-indicator">{{ getSortIndicator('enrolledStudents') }}</span>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Status</span>
                  <select v-model="headerStatusFilter" @click.stop>
                    <option value="">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="filteredCourses.length === 0">
              <td colspan="13" class="empty-state">No courses found for current filters.</td>
            </tr>

            <tr
              v-for="course in filteredCourses"
              :key="course.id"
              :class="{ 'row-selected': selectedIds.includes(course.id) }"
            >
              <td class="checkbox-col sticky-left body-sticky">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(course.id)"
                  @change="toggleSelection(course.id)"
                />
              </td>

              <td>#{{ course.id }}</td>

              <td>
                <button class="course-link" @click="goToView(course.id)">
                  <span class="course-link-name">{{ course.name }}</span>
                  <span class="course-link-meta">View details ↗</span>
                </button>
              </td>

              <td>{{ course.code }}</td>
              <td>{{ course.duration }}</td>
              <td>{{ formatCurrency(course.fees) }}</td>
              <td>{{ course.batch }}</td>
              <td>{{ course.trainer }}</td>
              <td>{{ course.assistantTrainer || '-' }}</td>
              <td>{{ formatDate(course.startDate) }}</td>
              <td>{{ formatDate(course.endDate) }}</td>
              <td>{{ course.enrolledStudents }}/{{ course.maxStudents }}</td>
              <td>
                <span
                  class="status-pill"
                  :class="course.status === 'Active' ? 'status-active' : 'status-inactive'"
                >
                  {{ course.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useCourseStore, durationOptions, trainerOptions, type Course } from '@/stores/courseStore'
import { useStudentStore } from '@/stores/studentsStore'
import { useBatchesStore } from '@/stores/batchesStore'

type SortField = 'id' | 'name' | 'code' | 'fees' | 'startDate' | 'enrolledStudents'
type SortDirection = 'asc' | 'desc'
type QuickStatus = 'All' | 'Active' | 'Inactive'

const router = useRouter()
const courseStore = useCourseStore()
const studentStore = useStudentStore()
const batchStore = useBatchesStore()

const { courses } = storeToRefs(courseStore)
const { init, deleteCourses, restoreCourses } = courseStore

onMounted(() => {
  init()
  batchStore.init()
  studentStore.init()
})

const globalSearch = ref('')
const durationFilter = ref('')
const statusFilter = ref('')
const batchFilter = ref('')
const trainerFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const quickStatus = ref<QuickStatus>('All')

const sortField = ref<SortField>('id')
const sortDirection = ref<SortDirection>('asc')

const headerDurationFilter = ref('')
const headerBatchFilter = ref('')
const headerTrainerFilter = ref('')
const headerStatusFilter = ref('')

const selectedIds = ref<number[]>([])
const lastDeletedCourses = ref<Course[]>([])
const showUndo = ref(false)

const durationOptionsList = computed(() => [...durationOptions])
const batchOptionsList = computed(() => ['Morning', 'Afternoon', 'Evening'])
const trainerOptionsList = computed(() => [...trainerOptions])

const totalCourses = computed(() => courses.value.length)
const activeCount = computed(
  () => courses.value.filter((course) => course.status === 'Active').length,
)
const inactiveCount = computed(
  () => courses.value.filter((course) => course.status === 'Inactive').length,
)
const totalEnrolled = computed(() =>
  courses.value.reduce((sum, course) => sum + course.enrolledStudents, 0),
)

const normalizeDate = (value: string) => {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

const filteredCourses = computed(() => {
  const query = globalSearch.value.trim().toLowerCase()

  const result = [...courses.value].filter((course) => {
    const matchesGlobal =
      !query ||
      course.name.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query) ||
      course.duration.toLowerCase().includes(query) ||
      course.batch.toLowerCase().includes(query) ||
      course.trainer.toLowerCase().includes(query) ||
      course.assistantTrainer.toLowerCase().includes(query)

    const matchesDuration = !durationFilter.value || course.duration === durationFilter.value
    const matchesStatus = !statusFilter.value || course.status === statusFilter.value
    const matchesBatch = !batchFilter.value || course.batch === batchFilter.value
    const matchesTrainer = !trainerFilter.value || course.trainer === trainerFilter.value
    const matchesQuickStatus = quickStatus.value === 'All' || course.status === quickStatus.value

    const matchesHeaderDuration =
      !headerDurationFilter.value || course.duration === headerDurationFilter.value
    const matchesHeaderBatch = !headerBatchFilter.value || course.batch === headerBatchFilter.value
    const matchesHeaderTrainer =
      !headerTrainerFilter.value || course.trainer === headerTrainerFilter.value
    const matchesHeaderStatus =
      !headerStatusFilter.value || course.status === headerStatusFilter.value

    const normalizedStartDate = normalizeDate(course.startDate)
    const matchesDateFrom = !dateFrom.value || normalizedStartDate >= dateFrom.value
    const matchesDateTo = !dateTo.value || normalizedStartDate <= dateTo.value

    return (
      matchesGlobal &&
      matchesDuration &&
      matchesStatus &&
      matchesBatch &&
      matchesTrainer &&
      matchesQuickStatus &&
      matchesHeaderDuration &&
      matchesHeaderBatch &&
      matchesHeaderTrainer &&
      matchesHeaderStatus &&
      matchesDateFrom &&
      matchesDateTo
    )
  })

  result.sort((a, b) => {
    if (sortField.value === 'id') {
      return sortDirection.value === 'asc' ? a.id - b.id : b.id - a.id
    }
    if (sortField.value === 'name') {
      return sortDirection.value === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    }
    if (sortField.value === 'code') {
      return sortDirection.value === 'asc'
        ? a.code.localeCompare(b.code)
        : b.code.localeCompare(a.code)
    }
    if (sortField.value === 'fees') {
      return sortDirection.value === 'asc' ? a.fees - b.fees : b.fees - a.fees
    }
    if (sortField.value === 'startDate') {
      const aDate = new Date(a.startDate).getTime()
      const bDate = new Date(b.startDate).getTime()
      return sortDirection.value === 'asc' ? aDate - bDate : bDate - aDate
    }
    if (sortField.value === 'enrolledStudents') {
      return sortDirection.value === 'asc'
        ? a.enrolledStudents - b.enrolledStudents
        : b.enrolledStudents - a.enrolledStudents
    }
    return 0
  })

  return result
})

const isAllVisibleSelected = computed(() => {
  if (!filteredCourses.value.length) return false
  return filteredCourses.value.every((course) => selectedIds.value.includes(course.id))
})

const toggleSelection = (id: number) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter((item) => item !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

const toggleSelectAllVisible = () => {
  if (isAllVisibleSelected.value) {
    const visibleIds = new Set(filteredCourses.value.map((course) => course.id))
    selectedIds.value = selectedIds.value.filter((id) => !visibleIds.has(id))
    return
  }

  const merged = new Set([
    ...selectedIds.value,
    ...filteredCourses.value.map((course) => course.id),
  ])
  selectedIds.value = [...merged]
}

const setQuickStatus = (status: QuickStatus) => {
  quickStatus.value = status
}

const setSort = (field: SortField) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    return
  }

  sortField.value = field
  sortDirection.value = 'asc'
}

const getSortIndicator = (field: SortField) => {
  if (sortField.value !== field) return '↕'
  return sortDirection.value === 'asc' ? '↑' : '↓'
}

const resetAllFilters = () => {
  globalSearch.value = ''
  durationFilter.value = ''
  statusFilter.value = ''
  batchFilter.value = ''
  trainerFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  quickStatus.value = 'All'

  headerDurationFilter.value = ''
  headerBatchFilter.value = ''
  headerTrainerFilter.value = ''
  headerStatusFilter.value = ''

  sortField.value = 'id'
  sortDirection.value = 'asc'
}

const goToView = (id: number) => {
  router.push(`/courses/view/${id}`)
}

const deleteSelectedCourses = () => {
  if (!selectedIds.value.length) return

  const blockedCourses = courses.value.filter(
    (course) => selectedIds.value.includes(course.id) && course.enrolledStudents > 0,
  )

  if (blockedCourses.length) {
    alert('You cannot delete courses that still have enrolled students.')
    return
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete ${selectedIds.value.length} selected course(s)?`,
  )
  if (!confirmed) return

  const removed = deleteCourses(selectedIds.value)
  lastDeletedCourses.value = removed
  showUndo.value = removed.length > 0
  selectedIds.value = []
}

const undoDelete = () => {
  if (!lastDeletedCourses.value.length) return
  restoreCourses(lastDeletedCourses.value)
  studentStore.init()
  lastDeletedCourses.value = []
  showUndo.value = false
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

const sanitize = (value: string | number) => {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

const getExportRows = (rows: Course[]) => {
  return rows.map((course) => ({
    ID: course.id,
    Name: course.name,
    Code: course.code,
    Duration: course.duration,
    Fees: course.fees,
    Batch: course.batch,
    Trainer: course.trainer,
    AssistantTrainer: course.assistantTrainer,
    StartDate: course.startDate,
    EndDate: course.endDate,
    EnrolledStudents: course.enrolledStudents,
    MaxStudents: course.maxStudents,
    Status: course.status,
  }))
}

const downloadFile = (content: BlobPart, fileName: string, type: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

const exportCsv = () => {
  const rows = getExportRows(filteredCourses.value)
  const headers = Object.keys(
    rows[0] ?? {
      ID: '',
      Name: '',
      Code: '',
      Duration: '',
      Fees: '',
      Batch: '',
      Trainer: '',
      AssistantTrainer: '',
      StartDate: '',
      EndDate: '',
      EnrolledStudents: '',
      MaxStudents: '',
      Status: '',
    },
  )

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => sanitize(row[header as keyof typeof row])).join(','),
    ),
  ].join('\n')

  downloadFile(csv, 'courses-export.csv', 'text/csv;charset=utf-8;')
}

const exportExcel = () => {
  const rows = getExportRows(filteredCourses.value)

  const tableHtml = `
    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Code</th>
          <th>Duration</th>
          <th>Fees</th>
          <th>Batch</th>
          <th>Trainer</th>
          <th>Assistant Trainer</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Enrolled Students</th>
          <th>Max Students</th>
          <th>Status</th>
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
            <td>${row.Duration}</td>
            <td>${row.Fees}</td>
            <td>${row.Batch}</td>
            <td>${row.Trainer}</td>
            <td>${row.AssistantTrainer}</td>
            <td>${row.StartDate}</td>
            <td>${row.EndDate}</td>
            <td>${row.EnrolledStudents}</td>
            <td>${row.MaxStudents}</td>
            <td>${row.Status}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  `

  downloadFile(tableHtml, 'courses-export.xls', 'application/vnd.ms-excel')
}

const exportJson = () => {
  const rows = getExportRows(filteredCourses.value)
  downloadFile(JSON.stringify(rows, null, 2), 'courses-export.json', 'application/json')
}

const printTable = () => {
  const rows = getExportRows(filteredCourses.value)

  const html = `
    <html>
      <head>
        <title>Courses Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h2 { margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h2>Courses Report</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Code</th>
              <th>Duration</th>
              <th>Fees</th>
              <th>Batch</th>
              <th>Trainer</th>
              <th>Assistant Trainer</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Enrolled Students</th>
              <th>Max Students</th>
              <th>Status</th>
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
                <td>${row.Duration}</td>
                <td>${row.Fees}</td>
                <td>${row.Batch}</td>
                <td>${row.Trainer}</td>
                <td>${row.AssistantTrainer}</td>
                <td>${row.StartDate}</td>
                <td>${row.EndDate}</td>
                <td>${row.EnrolledStudents}</td>
                <td>${row.MaxStudents}</td>
                <td>${row.Status}</td>
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
.course-page {
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

.stat-card-active {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
}

.stat-card-inactive {
  background: linear-gradient(135deg, #c2410c, #f97316);
}

.stat-card-students {
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

.courses-table {
  width: 100%;
  min-width: 1500px;
  border-collapse: collapse;
}

.courses-table thead th {
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

.courses-table tbody td {
  padding: 10px 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  white-space: nowrap;
  vertical-align: middle;
  color: #334155;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.98);
}

.courses-table tbody tr {
  transition: 0.22s ease;
}

.courses-table tbody tr:nth-child(even) td {
  background: rgba(248, 250, 252, 0.98);
}

.courses-table tbody tr:hover td {
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

.course-link {
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

.course-link-name {
  color: var(--primary);
  font-weight: 800;
  font-size: 14px;
  line-height: 1.2;
}

.course-link-meta {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
  opacity: 0.95;
}

.course-link:hover .course-link-name {
  text-decoration: underline;
}

.course-link:hover .course-link-meta {
  color: #4f46e5;
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
  .course-page {
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
