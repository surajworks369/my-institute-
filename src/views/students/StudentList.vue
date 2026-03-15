<template>
  <div class="student-page fade-in">
    <section class="stats-grid">
      <div class="stat-card stat-card-total">
        <div class="stat-icon">👨‍🎓</div>
        <div class="stat-content">
          <p>Total Students</p>
          <h3>{{ totalStudents }}</h3>
          <small>Current registered students</small>
        </div>
      </div>

      <div class="stat-card stat-card-active">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <p>Active Students</p>
          <h3>{{ activeCount }}</h3>
          <small>Currently active admissions</small>
        </div>
      </div>

      <div class="stat-card stat-card-inactive">
        <div class="stat-icon">⏸️</div>
        <div class="stat-content">
          <p>Inactive Students</p>
          <h3>{{ inactiveCount }}</h3>
          <small>Paused / inactive records</small>
        </div>
      </div>

      <div class="stat-card stat-card-courses">
        <div class="stat-icon">📘</div>
        <div class="stat-content">
          <p>Courses</p>
          <h3>{{ totalCourses }}</h3>
          <small>Mapped across students</small>
        </div>
      </div>
    </section>

    <section class="panel card">
      <div class="section-top">
        <div class="title-block">
          <p class="eyebrow">Student Management</p>
          <h2>Student List</h2>
        </div>

        <div class="section-actions">
          <div class="search-box">
            <span class="search-icon">🔎</span>
            <input
              v-model="globalSearch"
              type="text"
              placeholder="Search by name, email, phone, course, city..."
            />
          </div>

          <router-link class="app-btn app-btn-primary app-btn-pill top-add-btn" to="/students/add">
            + Add Student
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
            <label>Course</label>
            <select v-model="courseFilter">
              <option value="">All Courses</option>
              <option v-for="course in courseOptions" :key="course" :value="course">
                {{ course }}
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
              <option v-for="batch in batchOptions" :key="batch" :value="batch">
                {{ batch }}
              </option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Gender</label>
            <select v-model="genderFilter">
              <option value="">All Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="toolbar-field">
            <label>Admission From</label>
            <input v-model="dateFrom" type="date" />
          </div>

          <div class="toolbar-field">
            <label>Admission To</label>
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
              @click="deleteSelectedStudents"
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
          <span class="meta-chip soft-chip">{{ filteredStudents.length }} records found</span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="students-table">
          <thead>
            <tr>
              <th class="checkbox-col sticky-left">
                <input
                  type="checkbox"
                  :checked="isAllVisibleSelected"
                  @change="toggleSelectAllVisible"
                  aria-label="Select all visible students"
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

              <th>Email</th>
              <th>Phone</th>

              <th>
                <div class="th-filter-box">
                  <span>Course</span>
                  <select v-model="headerCourseFilter" @click.stop>
                    <option value="">All</option>
                    <option v-for="course in courseOptions" :key="course" :value="course">
                      {{ course }}
                    </option>
                  </select>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Batch</span>
                  <select v-model="headerBatchFilter" @click.stop>
                    <option value="">All</option>
                    <option v-for="batch in batchOptions" :key="batch" :value="batch">
                      {{ batch }}
                    </option>
                  </select>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>Gender</span>
                  <select v-model="headerGenderFilter" @click.stop>
                    <option value="">All</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </th>

              <th>
                <div class="th-filter-box">
                  <span>City</span>
                  <select v-model="headerCityFilter" @click.stop>
                    <option value="">All</option>
                    <option v-for="city in cityOptions" :key="city" :value="city">
                      {{ city }}
                    </option>
                  </select>
                </div>
              </th>

              <th @click="setSort('admissionDate')" class="sortable-th">
                <div class="th-content">
                  <span>Admission Date</span>
                  <span class="sort-indicator">{{ getSortIndicator('admissionDate') }}</span>
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
            <tr v-if="filteredStudents.length === 0">
              <td colspan="11" class="empty-state">No students found for current filters.</td>
            </tr>

            <tr
              v-for="student in filteredStudents"
              :key="student.id"
              :class="{ 'row-selected': selectedIds.includes(student.id) }"
            >
              <td class="checkbox-col sticky-left body-sticky">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(student.id)"
                  @change="toggleSelection(student.id)"
                />
              </td>

              <td>#{{ student.id }}</td>

              <td>
                <button class="student-link" @click="goToView(student.id)">
                  <span class="student-link-name">{{ student.name }}</span>
                  <span class="student-link-meta">View details ↗</span>
                </button>
              </td>

              <td>{{ student.email }}</td>
              <td>{{ student.phone }}</td>
              <td>{{ student.course }}</td>
              <td>{{ student.batch }}</td>
              <td>{{ student.gender }}</td>
              <td>{{ student.city }}</td>
              <td>{{ formatDate(student.admissionDate) }}</td>
              <td>
                <span
                  class="status-pill"
                  :class="student.status === 'Active' ? 'status-active' : 'status-inactive'"
                >
                  {{ student.status }}
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
import { useStudentStore } from '@/stores/studentsStore'
import type { Student } from '@/types/student'

type SortField = 'id' | 'name' | 'admissionDate'
type SortDirection = 'asc' | 'desc'
type QuickStatus = 'All' | 'Active' | 'Inactive'

const router = useRouter()
const studentStore = useStudentStore()
const {
  students,
  cityList,
  init,
  getCourseOptions,
  getBatchOptions,
  deleteStudents,
  restoreStudents,
} = studentStore

onMounted(() => {
  init()
})

const globalSearch = ref('')
const courseFilter = ref('')
const statusFilter = ref('')
const batchFilter = ref('')
const genderFilter = ref('')
const dateFrom = ref('')
const dateTo = ref('')

const quickStatus = ref<QuickStatus>('All')

const sortField = ref<SortField>('id')
const sortDirection = ref<SortDirection>('asc')

const headerCourseFilter = ref('')
const headerBatchFilter = ref('')
const headerGenderFilter = ref('')
const headerCityFilter = ref('')
const headerStatusFilter = ref('')

const selectedIds = ref<number[]>([])
const lastDeletedStudents = ref<Student[]>([])
const showUndo = ref(false)

const courseOptions = computed(() => getCourseOptions())
const batchOptions = computed(() => getBatchOptions())
const cityOptions = computed(() => cityList)

const totalStudents = computed(() => students.length)
const activeCount = computed(() => students.filter((student) => student.status === 'Active').length)
const inactiveCount = computed(
  () => students.filter((student) => student.status === 'Inactive').length,
)
const totalCourses = computed(() => new Set(students.map((student) => student.course)).size)

const normalizeDate = (value: string) => {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

const filteredStudents = computed(() => {
  const query = globalSearch.value.trim().toLowerCase()

  const result = [...students].filter((student) => {
    const matchesGlobal =
      !query ||
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.phone.toLowerCase().includes(query) ||
      student.course.toLowerCase().includes(query) ||
      student.city.toLowerCase().includes(query) ||
      student.batch.toLowerCase().includes(query)

    const matchesCourse = !courseFilter.value || student.course === courseFilter.value
    const matchesStatus = !statusFilter.value || student.status === statusFilter.value
    const matchesBatch = !batchFilter.value || student.batch === batchFilter.value
    const matchesGender = !genderFilter.value || student.gender === genderFilter.value
    const matchesQuickStatus = quickStatus.value === 'All' || student.status === quickStatus.value

    const matchesHeaderCourse =
      !headerCourseFilter.value || student.course === headerCourseFilter.value
    const matchesHeaderBatch = !headerBatchFilter.value || student.batch === headerBatchFilter.value
    const matchesHeaderGender =
      !headerGenderFilter.value || student.gender === headerGenderFilter.value
    const matchesHeaderCity = !headerCityFilter.value || student.city === headerCityFilter.value
    const matchesHeaderStatus =
      !headerStatusFilter.value || student.status === headerStatusFilter.value

    const normalizedStudentDate = normalizeDate(student.admissionDate)
    const matchesDateFrom = !dateFrom.value || normalizedStudentDate >= dateFrom.value
    const matchesDateTo = !dateTo.value || normalizedStudentDate <= dateTo.value

    return (
      matchesGlobal &&
      matchesCourse &&
      matchesStatus &&
      matchesBatch &&
      matchesGender &&
      matchesQuickStatus &&
      matchesHeaderCourse &&
      matchesHeaderBatch &&
      matchesHeaderGender &&
      matchesHeaderCity &&
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

    if (sortField.value === 'admissionDate') {
      const aDate = new Date(a.admissionDate).getTime()
      const bDate = new Date(b.admissionDate).getTime()
      return sortDirection.value === 'asc' ? aDate - bDate : bDate - aDate
    }

    return 0
  })

  return result
})

const isAllVisibleSelected = computed(() => {
  if (!filteredStudents.value.length) return false
  return filteredStudents.value.every((student) => selectedIds.value.includes(student.id))
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
    const visibleIds = new Set(filteredStudents.value.map((student) => student.id))
    selectedIds.value = selectedIds.value.filter((id) => !visibleIds.has(id))
    return
  }

  const merged = new Set([
    ...selectedIds.value,
    ...filteredStudents.value.map((student) => student.id),
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
  courseFilter.value = ''
  statusFilter.value = ''
  batchFilter.value = ''
  genderFilter.value = ''
  dateFrom.value = ''
  dateTo.value = ''
  quickStatus.value = 'All'

  headerCourseFilter.value = ''
  headerBatchFilter.value = ''
  headerGenderFilter.value = ''
  headerCityFilter.value = ''
  headerStatusFilter.value = ''

  sortField.value = 'id'
  sortDirection.value = 'asc'
}

const goToView = (id: number) => {
  router.push(`/students/view/${id}`)
}

const deleteSelectedStudents = () => {
  if (!selectedIds.value.length) return

  const confirmed = window.confirm(
    `Are you sure you want to delete ${selectedIds.value.length} selected student(s)?`,
  )
  if (!confirmed) return

  const removed = deleteStudents(selectedIds.value)
  lastDeletedStudents.value = removed
  showUndo.value = removed.length > 0
  selectedIds.value = []
}

const undoDelete = () => {
  if (!lastDeletedStudents.value.length) return
  restoreStudents(lastDeletedStudents.value)
  lastDeletedStudents.value = []
  showUndo.value = false
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB')
}

const sanitize = (value: string | number) => {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

const getExportRows = (rows: Student[]) => {
  return rows.map((student) => ({
    ID: student.id,
    Name: student.name,
    Email: student.email,
    Phone: student.phone,
    Course: student.course,
    Batch: student.batch,
    Gender: student.gender,
    City: student.city,
    AdmissionDate: student.admissionDate,
    Status: student.status,
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
  const rows = getExportRows(filteredStudents.value)
  const headers = Object.keys(
    rows[0] ?? {
      ID: '',
      Name: '',
      Email: '',
      Phone: '',
      Course: '',
      Batch: '',
      Gender: '',
      City: '',
      AdmissionDate: '',
      Status: '',
    },
  )

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((header) => sanitize(row[header as keyof typeof row])).join(','),
    ),
  ].join('\n')

  downloadFile(csv, 'students-export.csv', 'text/csv;charset=utf-8;')
}

const exportExcel = () => {
  const rows = getExportRows(filteredStudents.value)

  const tableHtml = `
    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Course</th>
          <th>Batch</th>
          <th>Gender</th>
          <th>City</th>
          <th>Admission Date</th>
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
            <td>${row.Email}</td>
            <td>${row.Phone}</td>
            <td>${row.Course}</td>
            <td>${row.Batch}</td>
            <td>${row.Gender}</td>
            <td>${row.City}</td>
            <td>${row.AdmissionDate}</td>
            <td>${row.Status}</td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  `

  downloadFile(tableHtml, 'students-export.xls', 'application/vnd.ms-excel')
}

const exportJson = () => {
  const rows = getExportRows(filteredStudents.value)
  downloadFile(JSON.stringify(rows, null, 2), 'students-export.json', 'application/json')
}

const printTable = () => {
  const rows = getExportRows(filteredStudents.value)

  const html = `
    <html>
      <head>
        <title>Students Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h2 { margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 12px; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        <h2>Students Report</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Gender</th>
              <th>City</th>
              <th>Admission Date</th>
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
                <td>${row.Email}</td>
                <td>${row.Phone}</td>
                <td>${row.Course}</td>
                <td>${row.Batch}</td>
                <td>${row.Gender}</td>
                <td>${row.City}</td>
                <td>${row.AdmissionDate}</td>
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
.student-page {
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
  width: 340px;
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
  min-width: 165px;
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

.students-table {
  width: 100%;
  min-width: 1280px;
  border-collapse: collapse;
}

.students-table thead th {
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
  min-width: 110px;
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

.students-table tbody td {
  padding: 10px 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  white-space: nowrap;
  vertical-align: middle;
  color: #334155;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.98);
}

.students-table tbody tr {
  transition: 0.22s ease;
}

.students-table tbody tr:nth-child(even) td {
  background: rgba(248, 250, 252, 0.98);
}

.students-table tbody tr:hover td {
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

.student-link {
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

.student-link-name {
  color: var(--primary);
  font-weight: 800;
  font-size: 14px;
  line-height: 1.2;
}

.student-link-meta {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.2px;
  opacity: 0.95;
}

.student-link:hover .student-link-name {
  text-decoration: underline;
}

.student-link:hover .student-link-meta {
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
  .student-page {
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
