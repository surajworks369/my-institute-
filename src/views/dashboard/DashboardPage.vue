<template>
  <div class="dashboard-page fade-in">
    <!-- Hero -->
    <section class="hero-card">
      <div class="hero-content">
        <div>
          <p class="hero-eyebrow">Institute Overview</p>
          <h1>Dashboard</h1>
          <p class="hero-subtitle">
            Monitor students, academics, fees, staff, alerts, and quick insights from one place.
          </p>
        </div>

        <div class="hero-highlight-grid">
          <div class="hero-mini-card">
            <span>Total Students</span>
            <strong>{{ totalStudents }}</strong>
          </div>
          <div class="hero-mini-card">
            <span>Fees Collected</span>
            <strong>{{ formatCurrency(totalCollected) }}</strong>
          </div>
          <div class="hero-mini-card">
            <span>Upcoming Exams</span>
            <strong>{{ filteredUpcomingExams.length }}</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters -->
    <section class="panel card filter-panel">
      <div class="section-top compact-top">
        <div class="title-block">
          <p class="eyebrow">Dashboard Filters</p>
          <h2>Quick Filters</h2>
        </div>

        <div class="toolbar-actions-right">
          <button class="app-btn app-btn-secondary compact-btn" @click="resetFilters">Reset</button>
        </div>
      </div>

      <div class="toolbar-grid dashboard-toolbar-grid">
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
          <label>Batch</label>
          <select v-model="batchFilter">
            <option value="">All Batches</option>
            <option v-for="batch in batchOptions" :key="batch" :value="batch">
              {{ batch }}
            </option>
          </select>
        </div>

        <div class="toolbar-field">
          <label>Academic Session</label>
          <select v-model="academicSessionFilter">
            <option value="">All Sessions</option>
            <option v-for="session in academicSessions" :key="session" :value="session">
              {{ session }}
            </option>
          </select>
        </div>

        <div class="toolbar-field">
          <label>Quick Status</label>
          <select v-model="quickStatusFilter">
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Upcoming">Upcoming Exams</option>
            <option value="Overdue">Overdue Fees</option>
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
    </section>

    <!-- Main Stat Cards -->
    <section class="stats-grid dashboard-stats-grid">
      <div class="stat-card stat-card-total">
        <div class="stat-icon">👨‍🎓</div>
        <div class="stat-content">
          <p>Total Students</p>
          <h3>{{ totalStudents }}</h3>
          <small>{{ activeStudents }} active · {{ inactiveStudents }} inactive</small>
        </div>
      </div>

      <div class="stat-card stat-card-courses">
        <div class="stat-icon">📘</div>
        <div class="stat-content">
          <p>Active Courses</p>
          <h3>{{ activeCourses }}</h3>
          <small>{{ totalCourses }} total courses</small>
        </div>
      </div>

      <div class="stat-card stat-card-info">
        <div class="stat-icon">🧩</div>
        <div class="stat-content">
          <p>Total Batches</p>
          <h3>{{ totalBatches }}</h3>
          <small>{{ activeBatches }} active · {{ inactiveBatches }} inactive</small>
        </div>
      </div>

      <div class="stat-card stat-card-staff">
        <div class="stat-icon">👨‍🏫</div>
        <div class="stat-content">
          <p>Total Staff</p>
          <h3>{{ totalStaff }}</h3>
          <small>{{ activeStaff }} active · {{ onLeaveStaff }} on leave</small>
        </div>
      </div>

      <div class="stat-card stat-card-active">
        <div class="stat-icon">🕒</div>
        <div class="stat-content">
          <p>Attendance Summary</p>
          <h3>{{ attendancePercentage }}%</h3>
          <small>{{ filteredAttendanceItems.length }} attendance records</small>
        </div>
      </div>

      <div class="stat-card stat-card-warning">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <p>Exams Summary</p>
          <h3>{{ totalExams }}</h3>
          <small>{{ filteredUpcomingExams.length }} upcoming exams</small>
        </div>
      </div>

      <div class="stat-card stat-card-success">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <p>Fees Collected</p>
          <h3>{{ formatCurrency(totalCollected) }}</h3>
          <small>{{ paidFeesCount }} fully paid records</small>
        </div>
      </div>

      <div class="stat-card stat-card-inactive">
        <div class="stat-icon">⚠️</div>
        <div class="stat-content">
          <p>Pending Fees</p>
          <h3>{{ formatCurrency(totalPending) }}</h3>
          <small>{{ overdueFeesCount }} overdue records</small>
        </div>
      </div>
    </section>

    <!-- Insight Cards -->
    <section class="insight-grid">
      <div class="panel card insight-card">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Student Insight</p>
            <h3>Active vs Inactive</h3>
          </div>
        </div>

        <div class="metric-list">
          <div class="metric-row">
            <span>Active Students</span>
            <strong>{{ activeStudents }}</strong>
          </div>
          <div class="progress-line">
            <span :style="{ width: `${studentActivePercent}%` }"></span>
          </div>

          <div class="metric-row">
            <span>Inactive Students</span>
            <strong>{{ inactiveStudents }}</strong>
          </div>
          <div class="progress-line warning-line">
            <span :style="{ width: `${studentInactivePercent}%` }"></span>
          </div>
        </div>
      </div>

      <div class="panel card insight-card">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Attendance Insight</p>
            <h3>Status Distribution</h3>
          </div>
        </div>

        <div class="metric-list">
          <div class="metric-row">
            <span>Present</span><strong>{{ presentCount }}</strong>
          </div>
          <div class="metric-row">
            <span>Absent</span><strong>{{ absentCount }}</strong>
          </div>
          <div class="metric-row">
            <span>Late</span><strong>{{ lateCount }}</strong>
          </div>
          <div class="metric-row">
            <span>Leave</span><strong>{{ leaveCount }}</strong>
          </div>
        </div>
      </div>

      <div class="panel card insight-card">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Exam Insight</p>
            <h3>Pass vs Fail</h3>
          </div>
        </div>

        <div class="metric-list">
          <div class="metric-row">
            <span>Pass</span><strong>{{ passCount }}</strong>
          </div>
          <div class="metric-row">
            <span>Fail</span><strong>{{ failCount }}</strong>
          </div>
          <div class="progress-line success-line">
            <span :style="{ width: `${passPercentage}%` }"></span>
          </div>
        </div>
      </div>

      <div class="panel card insight-card">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Fees Insight</p>
            <h3>Fee Status</h3>
          </div>
        </div>

        <div class="metric-list">
          <div class="metric-row">
            <span>Paid</span><strong>{{ paidFeesCount }}</strong>
          </div>
          <div class="metric-row">
            <span>Partial</span><strong>{{ partialFeesCount }}</strong>
          </div>
          <div class="metric-row">
            <span>Pending</span><strong>{{ pendingFeesCount }}</strong>
          </div>
          <div class="metric-row">
            <span>Overdue</span><strong>{{ overdueFeesCount }}</strong>
          </div>
        </div>
      </div>

      <div class="panel card insight-card">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Staff Insight</p>
            <h3>Employment Status</h3>
          </div>
        </div>

        <div class="metric-list">
          <div class="metric-row">
            <span>Active</span><strong>{{ activeStaff }}</strong>
          </div>
          <div class="metric-row">
            <span>Inactive</span><strong>{{ inactiveStaff }}</strong>
          </div>
          <div class="metric-row">
            <span>On Leave</span><strong>{{ onLeaveStaff }}</strong>
          </div>
        </div>
      </div>
    </section>

    <!-- Charts -->
    <section class="chart-grid">
      <div class="panel card">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Admissions</p>
            <h3>Monthly Admissions</h3>
          </div>
        </div>

        <div class="mini-chart">
          <div v-for="item in monthlyAdmissions" :key="item.label" class="chart-bar-item">
            <div class="chart-bar-wrap">
              <div
                class="chart-bar"
                :style="{ height: `${getBarHeight(item.value, maxMonthlyAdmissions)}%` }"
              ></div>
            </div>
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="panel card">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Finance</p>
            <h3>Fees Collection</h3>
          </div>
        </div>

        <div class="mini-chart">
          <div v-for="item in monthlyFeesCollection" :key="item.label" class="chart-bar-item">
            <div class="chart-bar-wrap">
              <div
                class="chart-bar success-bar"
                :style="{ height: `${getBarHeight(item.value, maxMonthlyFeesCollection)}%` }"
              ></div>
            </div>
            <strong>{{ compactCurrency(item.value) }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="panel card">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Attendance</p>
            <h3>Attendance Distribution</h3>
          </div>
        </div>

        <div class="distribution-list">
          <div v-for="item in attendanceDistribution" :key="item.label" class="distribution-item">
            <div class="distribution-head">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <div class="progress-line">
              <span :style="{ width: `${item.percent}%` }"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel card">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Results</p>
            <h3>Exam Result Summary</h3>
          </div>
        </div>

        <div class="distribution-list">
          <div v-for="item in examResultDistribution" :key="item.label" class="distribution-item">
            <div class="distribution-head">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <div
              class="progress-line"
              :class="item.label === 'Fail' ? 'warning-line' : 'success-line'"
            >
              <span :style="{ width: `${item.percent}%` }"></span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel card chart-span-2">
        <div class="panel-head">
          <div>
            <p class="eyebrow">Course Trend</p>
            <h3>Course-wise Student Count</h3>
          </div>
        </div>

        <div class="course-bars">
          <div v-for="item in topCourseWiseStudents" :key="item.label" class="course-bar-row">
            <div class="course-label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
            <div class="progress-line">
              <span :style="{ width: `${item.percent}%` }"></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="panel card">
      <div class="panel-head">
        <div>
          <p class="eyebrow">Quick Actions</p>
          <h3>Go To Important Tasks</h3>
        </div>
      </div>

      <div class="quick-actions-grid">
        <button class="quick-action-btn quick-action-primary" @click="goTo('/students/add')">
          <span>➕</span>
          <div>
            <strong>Add Student</strong>
            <small>Create new student record</small>
          </div>
        </button>

        <button class="quick-action-btn" @click="goTo('/attendance/add')">
          <span>🕘</span>
          <div>
            <strong>Mark Attendance</strong>
            <small>Record daily attendance</small>
          </div>
        </button>

        <button class="quick-action-btn" @click="goTo('/exams/add')">
          <span>📝</span>
          <div>
            <strong>Add Exam</strong>
            <small>Create new exam schedule</small>
          </div>
        </button>

        <button class="quick-action-btn" @click="goTo('/fees/add')">
          <span>💳</span>
          <div>
            <strong>Add Fee</strong>
            <small>Create fee entry</small>
          </div>
        </button>

        <button class="quick-action-btn" @click="goTo('/staff/add')">
          <span>👨‍💼</span>
          <div>
            <strong>Add Staff</strong>
            <small>Create staff record</small>
          </div>
        </button>

        <button class="quick-action-btn" @click="goTo('/reports')">
          <span>📊</span>
          <div>
            <strong>Open Reports</strong>
            <small>View analytics and exports</small>
          </div>
        </button>

        <button class="quick-action-btn" @click="goTo('/settings')">
          <span>⚙️</span>
          <div>
            <strong>Open Settings</strong>
            <small>Manage ERP preferences</small>
          </div>
        </button>
      </div>
    </section>

    <!-- Alerts -->
    <section class="alert-grid">
      <div class="alert-card overdue-alert">
        <div class="alert-icon">💸</div>
        <div>
          <strong>{{ overdueFeesCount }} overdue fee records</strong>
          <p>Immediate follow-up required for overdue payments.</p>
        </div>
      </div>

      <div class="alert-card attendance-alert">
        <div class="alert-icon">📉</div>
        <div>
          <strong>{{ lowAttendanceStudents.length }} low attendance students</strong>
          <p>These students may need extra academic follow-up.</p>
        </div>
      </div>

      <div class="alert-card exam-alert">
        <div class="alert-icon">📅</div>
        <div>
          <strong>{{ filteredUpcomingExams.length }} upcoming exams</strong>
          <p>Review schedules and notify relevant batches.</p>
        </div>
      </div>

      <div class="alert-card staff-alert">
        <div class="alert-icon">🧑‍🏫</div>
        <div>
          <strong>{{ onLeaveStaff }} staff on leave</strong>
          <p>Check allocation and replacement planning if needed.</p>
        </div>
      </div>
    </section>

    <!-- Tables -->
    <section class="widget-grid">
      <div class="panel card widget-card">
        <div class="widget-head">
          <div>
            <p class="eyebrow">Students</p>
            <h3>Recent Students</h3>
          </div>
          <button class="view-all-btn" @click="goTo('/students')">View All</button>
        </div>

        <div class="widget-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="recentStudents.length === 0">
                <td colspan="3" class="empty-cell">No data available.</td>
              </tr>
              <tr v-for="student in recentStudents" :key="student.id">
                <td>{{ student.name }}</td>
                <td>{{ student.course }}</td>
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
      </div>

      <div class="panel card widget-card">
        <div class="widget-head">
          <div>
            <p class="eyebrow">Exams</p>
            <h3>Upcoming Exams</h3>
          </div>
          <button class="view-all-btn" @click="goTo('/exams')">View All</button>
        </div>

        <div class="widget-table">
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="upcomingExamRows.length === 0">
                <td colspan="3" class="empty-cell">No data available.</td>
              </tr>
              <tr v-for="exam in upcomingExamRows" :key="exam.id">
                <td>{{ exam.name }}</td>
                <td>{{ formatDate(exam.examDate) }}</td>
                <td><span class="status-pill status-info">Upcoming</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel card widget-card">
        <div class="widget-head">
          <div>
            <p class="eyebrow">Payments</p>
            <h3>Recent Payments</h3>
          </div>
          <button class="view-all-btn" @click="goTo('/fees')">View All</button>
        </div>

        <div class="widget-table">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Paid</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="recentPayments.length === 0">
                <td colspan="3" class="empty-cell">No data available.</td>
              </tr>
              <tr v-for="payment in recentPayments" :key="payment.id">
                <td>{{ payment.studentName }}</td>
                <td>{{ formatCurrency(payment.amount) }}</td>
                <td>{{ payment.paymentMethod }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel card widget-card">
        <div class="widget-head">
          <div>
            <p class="eyebrow">Fees</p>
            <h3>Pending Fees</h3>
          </div>
          <button class="view-all-btn" @click="goTo('/fees')">View All</button>
        </div>

        <div class="widget-table">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Pending</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="pendingFeeRows.length === 0">
                <td colspan="3" class="empty-cell">No data available.</td>
              </tr>
              <tr v-for="fee in pendingFeeRows" :key="fee.id">
                <td>{{ fee.studentName }}</td>
                <td>{{ formatCurrency(fee.pendingAmount) }}</td>
                <td>
                  <span
                    class="status-pill"
                    :class="fee.status === 'Overdue' ? 'status-danger' : 'status-warning'"
                  >
                    {{ fee.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel card widget-card widget-card-wide">
        <div class="widget-head">
          <div>
            <p class="eyebrow">Attendance</p>
            <h3>Low Attendance Students</h3>
          </div>
          <button class="view-all-btn" @click="goTo('/attendance')">View All</button>
        </div>

        <div class="widget-table">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Attendance</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="lowAttendanceRows.length === 0">
                <td colspan="3" class="empty-cell">No data available.</td>
              </tr>
              <tr v-for="student in lowAttendanceRows" :key="student.id">
                <td>{{ student.name }}</td>
                <td>{{ student.course }}</td>
                <td>{{ student.attendancePercent }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/studentsStore'
import { useCourseStore } from '@/stores/courseStore'
import { useBatchesStore } from '@/stores/batchesStore'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { useExamStore } from '@/stores/examStore'
import { useFeesStore } from '@/stores/feesStore'
import { useStaffStore } from '@/stores/staffStore'
import { MASTER_ACADEMIC_SESSIONS } from '@/stores/erpMasterData'

type QuickStatusFilter = 'All' | 'Active' | 'Inactive' | 'Upcoming' | 'Overdue'

type StudentLike = {
  id: number
  name: string
  course: string
  batch: string
  admissionDate: string
  status: string
}

type FeeLike = {
  id: number
  studentId: number
  pendingAmount: number
  paidAmount: number
  status: string
  dueDate: string
  paymentMethod: string
  updatedAt: string
  createdAt: string
}

type AttendanceLike = {
  id: number
  studentId: number
  courseId: number
  batchId: number
  date: string
  status: string
}

type ExamLike = {
  id: number
  name: string
  courseId: number
  batchId: number
  examDate: string
  status: string
}

type ExamMarkLike = {
  id: number
  examId: number
  studentId: number
  status: string
}

type CourseLike = {
  id: number
  name: string
  status: string
  enrolledStudents: number
}

type BatchLike = {
  id: number
  name: string
  status: string
}

type StaffLike = {
  id: number
  fullName: string
  status: string
}

const router = useRouter()

const studentStore = useStudentStore()
const courseStore = useCourseStore()
const batchesStore = useBatchesStore()
const attendanceStore = useAttendanceStore()
const examStore = useExamStore()
const feesStore = useFeesStore()
const staffStore = useStaffStore()

const courseFilter = ref('')
const batchFilter = ref('')
const academicSessionFilter = ref('')
const quickStatusFilter = ref<QuickStatusFilter>('All')
const dateFrom = ref('')
const dateTo = ref('')

const academicSessions = [...MASTER_ACADEMIC_SESSIONS]

onMounted(() => {
  studentStore.init()
  courseStore.init()
  batchesStore.init()
  attendanceStore.init()
  examStore.init()
  feesStore.init()
  staffStore.init()
})

const students = computed<StudentLike[]>(() => [...studentStore.students] as StudentLike[])
const courses = computed<CourseLike[]>(() => [...courseStore.courses] as CourseLike[])
const batches = computed<BatchLike[]>(() => [...batchesStore.batches] as BatchLike[])
const attendanceItems = computed<AttendanceLike[]>(
  () => [...attendanceStore.items] as AttendanceLike[],
)
const exams = computed<ExamLike[]>(() => [...examStore.exams] as ExamLike[])
const examMarks = computed<ExamMarkLike[]>(() => [...examStore.marks] as ExamMarkLike[])
const fees = computed<FeeLike[]>(() => [...feesStore.fees] as FeeLike[])
const staffItems = computed<StaffLike[]>(() => [...staffStore.items] as StaffLike[])

const courseOptions = computed(() => courseStore.courseNames)
const batchOptions = computed(() => batchesStore.batchNames)

const normalizeYmd = (value: string) => {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

const matchesDateRange = (value: string) => {
  if (!value && !dateFrom.value && !dateTo.value) return true
  if (!value) return false

  const normalized = normalizeYmd(value)
  if (dateFrom.value && normalized < dateFrom.value) return false
  if (dateTo.value && normalized > dateTo.value) return false
  return true
}

const matchesSession = (value: string) => {
  if (!academicSessionFilter.value) return true
  if (!value) return false

  const year = new Date(value).getFullYear()
  const session = `${year}-${String((year + 1) % 100).padStart(2, '0')}`
  return session === academicSessionFilter.value
}

const filteredStudents = computed(() => {
  return students.value.filter((student) => {
    const courseOk = !courseFilter.value || student.course === courseFilter.value
    const batchOk = !batchFilter.value || student.batch === batchFilter.value
    const sessionOk = matchesSession(student.admissionDate)
    const dateOk = matchesDateRange(student.admissionDate)

    if (quickStatusFilter.value === 'Active' && student.status !== 'Active') return false
    if (quickStatusFilter.value === 'Inactive' && student.status !== 'Inactive') return false

    return courseOk && batchOk && sessionOk && dateOk
  })
})

const filteredCourseIds = computed(() => {
  if (!courseFilter.value) return new Set(courses.value.map((course) => course.id))
  return new Set(
    courses.value.filter((course) => course.name === courseFilter.value).map((course) => course.id),
  )
})

const filteredBatchIds = computed(() => {
  if (!batchFilter.value) return new Set(batches.value.map((batch) => batch.id))
  return new Set(
    batches.value.filter((batch) => batch.name === batchFilter.value).map((batch) => batch.id),
  )
})

const filteredAttendanceItems = computed(() => {
  return attendanceItems.value.filter((item) => {
    const courseOk = filteredCourseIds.value.has(item.courseId)
    const batchOk = filteredBatchIds.value.has(item.batchId)
    const dateOk = matchesDateRange(item.date)
    return courseOk && batchOk && dateOk
  })
})

const filteredExams = computed(() => {
  return exams.value.filter((exam) => {
    const courseOk = filteredCourseIds.value.has(exam.courseId)
    const batchOk = filteredBatchIds.value.has(exam.batchId)
    const dateOk = matchesDateRange(exam.examDate)

    if (quickStatusFilter.value === 'Upcoming' && exam.status !== 'Upcoming') return false

    return courseOk && batchOk && dateOk
  })
})

const filteredExamIds = computed(() => new Set(filteredExams.value.map((exam) => exam.id)))

const filteredExamMarks = computed(() => {
  return examMarks.value.filter((mark) => filteredExamIds.value.has(mark.examId))
})

const filteredFees = computed(() => {
  return fees.value.filter((fee) => {
    const student = students.value.find((item) => item.id === fee.studentId)
    if (!student) return false

    const courseOk = !courseFilter.value || student.course === courseFilter.value
    const batchOk = !batchFilter.value || student.batch === batchFilter.value
    const dateOk = matchesDateRange(fee.createdAt || fee.updatedAt || fee.dueDate)

    if (quickStatusFilter.value === 'Overdue' && fee.status !== 'Overdue') return false
    if (quickStatusFilter.value === 'Active' && student.status !== 'Active') return false
    if (quickStatusFilter.value === 'Inactive' && student.status !== 'Inactive') return false

    return courseOk && batchOk && dateOk
  })
})

const totalStudents = computed(() => filteredStudents.value.length)
const activeStudents = computed(
  () => filteredStudents.value.filter((student) => student.status === 'Active').length,
)
const inactiveStudents = computed(
  () => filteredStudents.value.filter((student) => student.status === 'Inactive').length,
)

const totalCourses = computed(() => courses.value.length)
const activeCourses = computed(
  () => courses.value.filter((course) => course.status === 'Active').length,
)

const totalBatches = computed(() => batches.value.length)
const activeBatches = computed(
  () => batches.value.filter((batch) => batch.status === 'Active').length,
)
const inactiveBatches = computed(
  () => batches.value.filter((batch) => batch.status === 'Inactive').length,
)

const totalStaff = computed(() => staffItems.value.length)
const activeStaff = computed(
  () => staffItems.value.filter((item) => item.status === 'Active').length,
)
const inactiveStaff = computed(
  () => staffItems.value.filter((item) => item.status === 'Inactive').length,
)
const onLeaveStaff = computed(
  () => staffItems.value.filter((item) => item.status === 'On Leave').length,
)

const presentCount = computed(
  () => filteredAttendanceItems.value.filter((item) => item.status === 'Present').length,
)
const absentCount = computed(
  () => filteredAttendanceItems.value.filter((item) => item.status === 'Absent').length,
)
const lateCount = computed(
  () => filteredAttendanceItems.value.filter((item) => item.status === 'Late').length,
)
const leaveCount = computed(
  () => filteredAttendanceItems.value.filter((item) => item.status === 'Leave').length,
)

const attendancePercentage = computed(() => {
  const total = filteredAttendanceItems.value.length
  if (!total) return 0
  return Math.round((presentCount.value / total) * 100)
})

const totalExams = computed(() => filteredExams.value.length)
const filteredUpcomingExams = computed(() =>
  filteredExams.value.filter((exam) => exam.status === 'Upcoming'),
)

const passCount = computed(
  () => filteredExamMarks.value.filter((mark) => mark.status === 'Pass').length,
)
const failCount = computed(
  () => filteredExamMarks.value.filter((mark) => mark.status === 'Fail').length,
)

const passPercentage = computed(() => {
  const total = passCount.value + failCount.value
  if (!total) return 0
  return Math.round((passCount.value / total) * 100)
})

const totalCollected = computed(() =>
  filteredFees.value.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0),
)
const totalPending = computed(() =>
  filteredFees.value.reduce((sum, item) => sum + Number(item.pendingAmount || 0), 0),
)
const paidFeesCount = computed(
  () => filteredFees.value.filter((item) => item.status === 'Paid').length,
)
const partialFeesCount = computed(
  () => filteredFees.value.filter((item) => item.status === 'Partial').length,
)
const pendingFeesCount = computed(
  () => filteredFees.value.filter((item) => item.status === 'Pending').length,
)
const overdueFeesCount = computed(
  () => filteredFees.value.filter((item) => item.status === 'Overdue').length,
)

const studentActivePercent = computed(() => {
  if (!totalStudents.value) return 0
  return Math.round((activeStudents.value / totalStudents.value) * 100)
})

const studentInactivePercent = computed(() => {
  if (!totalStudents.value) return 0
  return Math.round((inactiveStudents.value / totalStudents.value) * 100)
})

const monthlyAdmissions = computed(() => {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const monthMap = new Map(monthLabels.map((label) => [label, 0]))

  filteredStudents.value.forEach((student) => {
    const date = new Date(student.admissionDate)
    const label = date.toLocaleString('en-US', { month: 'short' })
    if (monthMap.has(label)) {
      monthMap.set(label, (monthMap.get(label) ?? 0) + 1)
    }
  })

  return monthLabels.map((label) => ({
    label,
    value: monthMap.get(label) ?? 0,
  }))
})

const maxMonthlyAdmissions = computed(() => {
  const values = monthlyAdmissions.value.map((item) => item.value)
  return Math.max(...values, 1)
})

const monthlyFeesCollection = computed(() => {
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const monthMap = new Map(monthLabels.map((label) => [label, 0]))

  filteredFees.value.forEach((fee) => {
    const sourceDate = fee.updatedAt || fee.createdAt || fee.dueDate
    const label = new Date(sourceDate).toLocaleString('en-US', { month: 'short' })
    if (monthMap.has(label)) {
      monthMap.set(label, (monthMap.get(label) ?? 0) + Number(fee.paidAmount || 0))
    }
  })

  return monthLabels.map((label) => ({
    label,
    value: monthMap.get(label) ?? 0,
  }))
})

const maxMonthlyFeesCollection = computed(() => {
  const values = monthlyFeesCollection.value.map((item) => item.value)
  return Math.max(...values, 1)
})

const attendanceDistribution = computed(() => {
  const total = filteredAttendanceItems.value.length || 1

  return [
    {
      label: 'Present',
      value: presentCount.value,
      percent: Math.round((presentCount.value / total) * 100),
    },
    {
      label: 'Absent',
      value: absentCount.value,
      percent: Math.round((absentCount.value / total) * 100),
    },
    { label: 'Late', value: lateCount.value, percent: Math.round((lateCount.value / total) * 100) },
    {
      label: 'Leave',
      value: leaveCount.value,
      percent: Math.round((leaveCount.value / total) * 100),
    },
  ]
})

const examResultDistribution = computed(() => {
  const total = passCount.value + failCount.value || 1

  return [
    { label: 'Pass', value: passCount.value, percent: Math.round((passCount.value / total) * 100) },
    { label: 'Fail', value: failCount.value, percent: Math.round((failCount.value / total) * 100) },
  ]
})

const topCourseWiseStudents = computed(() => {
  const counts = filteredStudents.value.reduce<Record<string, number>>((acc, student) => {
    acc[student.course] = (acc[student.course] ?? 0) + 1
    return acc
  }, {})

  const rows = Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const max = Math.max(...rows.map((item) => item.value), 1)

  return rows.map((item) => ({
    ...item,
    percent: Math.round((item.value / max) * 100),
  }))
})

const recentStudents = computed(() => {
  return [...filteredStudents.value]
    .sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime())
    .slice(0, 5)
})

const upcomingExamRows = computed(() => {
  return [...filteredUpcomingExams.value]
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .slice(0, 5)
})

const recentPayments = computed(() => {
  return [...filteredFees.value]
    .filter((item) => Number(item.paidAmount) > 0)
    .sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt).getTime()
      const bTime = new Date(b.updatedAt || b.createdAt).getTime()
      return bTime - aTime
    })
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      studentName: getStudentName(item.studentId),
      amount: Number(item.paidAmount || 0),
      paymentMethod: item.paymentMethod,
    }))
})

const pendingFeeRows = computed(() => {
  return [...filteredFees.value]
    .filter((item) => Number(item.pendingAmount) > 0)
    .sort((a, b) => Number(b.pendingAmount) - Number(a.pendingAmount))
    .slice(0, 5)
    .map((item) => ({
      ...item,
      studentName: getStudentName(item.studentId),
    }))
})

const lowAttendanceStudents = computed(() => {
  const grouped = new Map<number, { total: number; present: number }>()

  filteredAttendanceItems.value.forEach((item) => {
    const current = grouped.get(item.studentId) ?? { total: 0, present: 0 }
    current.total += 1
    if (item.status === 'Present') current.present += 1
    grouped.set(item.studentId, current)
  })

  return filteredStudents.value
    .map((student) => {
      const summary = grouped.get(student.id) ?? { total: 0, present: 0 }
      const attendancePercent = summary.total
        ? Math.round((summary.present / summary.total) * 100)
        : 0

      return {
        id: student.id,
        name: student.name,
        course: student.course,
        attendancePercent,
      }
    })
    .filter((student) => student.attendancePercent > 0 && student.attendancePercent < 75)
    .sort((a, b) => a.attendancePercent - b.attendancePercent)
})

const lowAttendanceRows = computed(() => lowAttendanceStudents.value.slice(0, 5))

function getStudentName(studentId: number) {
  return students.value.find((student) => student.id === studentId)?.name ?? `Student #${studentId}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function compactCurrency(value: number) {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `${Math.round(value / 1000)}K`
  return `${Math.round(value)}`
}

function formatDate(value: string) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-GB')
}

function getBarHeight(value: number, max: number) {
  if (!max) return 8
  return Math.max(Math.round((value / max) * 100), value > 0 ? 10 : 6)
}

function goTo(path: string) {
  router.push(path)
}

function resetFilters() {
  courseFilter.value = ''
  batchFilter.value = ''
  academicSessionFilter.value = ''
  quickStatusFilter.value = 'All'
  dateFrom.value = ''
  dateTo.value = ''
}
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-card {
  position: relative;
  overflow: hidden;
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(135deg, #1e3a8a, #4f46e5, #7c3aed);
  color: #ffffff;
  box-shadow: 0 18px 40px rgba(37, 99, 235, 0.2);
}

.hero-card::after {
  content: '';
  position: absolute;
  right: -50px;
  bottom: -50px;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}

.hero-eyebrow {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-weight: 800;
  opacity: 0.9;
  margin-bottom: 8px;
}

.hero-content h1 {
  font-size: 34px;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 10px;
}

.hero-subtitle {
  max-width: 680px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
}

.hero-highlight-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(140px, 1fr));
  gap: 12px;
  min-width: 420px;
}

.hero-mini-card {
  padding: 16px 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hero-mini-card span {
  font-size: 12px;
  opacity: 0.9;
}

.hero-mini-card strong {
  font-size: 20px;
  font-weight: 800;
}

.panel {
  padding: 22px;
  border-radius: 24px;
}

.filter-panel {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.72)), var(--card-bg);
}

.section-top,
.panel-head,
.widget-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 16px;
}

.compact-top {
  margin-bottom: 14px;
}

.title-block,
.panel-head > div,
.widget-head > div {
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

.panel h2,
.panel h3 {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.1;
}

.dashboard-toolbar-grid {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.toolbar-grid {
  display: grid;
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
  background: #ffffff;
  border: 1px solid #dbe3f3;
  color: #111827;
  font-weight: 500;
  border-radius: 12px;
  padding: 10px 12px;
}

.toolbar-actions-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.compact-btn {
  min-height: 40px;
  padding: 8px 14px;
  font-size: 14px;
}

.dashboard-stats-grid,
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

.stat-card-staff {
  background: linear-gradient(135deg, #7c2d12, #ea580c);
}

.stat-card-info {
  background: linear-gradient(135deg, #0f172a, #334155);
}

.stat-card-warning {
  background: linear-gradient(135deg, #854d0e, #eab308);
}

.stat-card-success {
  background: linear-gradient(135deg, #166534, #22c55e);
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
  font-size: 30px;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-content small {
  opacity: 0.88;
  font-size: 12px;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 18px;
}

.insight-card {
  min-height: 210px;
}

.metric-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: #334155;
}

.metric-row strong {
  color: #0f172a;
  font-size: 15px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.chart-span-2 {
  grid-column: span 2;
}

.mini-chart {
  min-height: 240px;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: end;
  gap: 14px;
  padding-top: 14px;
}

.chart-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 220px;
  justify-content: flex-end;
}

.chart-bar-wrap {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 8px;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fafc, #eef2ff);
}

.chart-bar {
  width: 100%;
  border-radius: 14px 14px 6px 6px;
  background: linear-gradient(180deg, #6366f1, #4f46e5);
  min-height: 12px;
}

.success-bar {
  background: linear-gradient(180deg, #22c55e, #15803d);
}

.chart-bar-item strong {
  font-size: 13px;
  color: #0f172a;
}

.chart-bar-item span {
  font-size: 12px;
  color: #64748b;
}

.distribution-list,
.course-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.distribution-item,
.course-bar-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.distribution-head,
.course-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #334155;
}

.distribution-head strong,
.course-label strong {
  color: #0f172a;
}

.progress-line {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #e5e7eb;
  overflow: hidden;
}

.progress-line span {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(135deg, #4f46e5, #3b82f6);
}

.success-line span {
  background: linear-gradient(135deg, #16a34a, #22c55e);
}

.warning-line span {
  background: linear-gradient(135deg, #ea580c, #f97316);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.quick-action-btn {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border-radius: 20px;
  padding: 16px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  text-align: left;
  cursor: pointer;
  transition: 0.22s ease;
}

.quick-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(15, 23, 42, 0.08);
}

.quick-action-btn span {
  font-size: 22px;
}

.quick-action-btn strong {
  display: block;
  font-size: 15px;
  color: #0f172a;
  margin-bottom: 4px;
}

.quick-action-btn small {
  color: #64748b;
  font-size: 12px;
}

.quick-action-primary {
  border-color: rgba(79, 70, 229, 0.2);
  background: linear-gradient(180deg, rgba(238, 242, 255, 0.85), #ffffff);
}

.alert-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.alert-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 18px;
  border-radius: 20px;
  color: #0f172a;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: #ffffff;
}

.alert-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.overdue-alert .alert-icon {
  background: rgba(249, 115, 22, 0.14);
}

.attendance-alert .alert-icon {
  background: rgba(59, 130, 246, 0.14);
}

.exam-alert .alert-icon {
  background: rgba(99, 102, 241, 0.14);
}

.staff-alert .alert-icon {
  background: rgba(16, 185, 129, 0.14);
}

.alert-card strong {
  display: block;
  margin-bottom: 6px;
}

.alert-card p {
  color: #64748b;
  font-size: 13px;
}

.widget-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.widget-card-wide {
  grid-column: span 2;
}

.view-all-btn {
  min-height: 36px;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #3730a3;
  font-weight: 700;
  cursor: pointer;
}

.widget-table {
  width: 100%;
  overflow: auto;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: rgba(255, 255, 255, 0.92);
}

.widget-table table {
  width: 100%;
  border-collapse: collapse;
  min-width: 520px;
}

.widget-table thead th {
  background: linear-gradient(180deg, #eff4ff, #e9eefc);
  color: #1e293b;
  font-size: 13px;
  font-weight: 800;
  padding: 12px 10px;
  text-align: left;
  border: 1px solid rgba(148, 163, 184, 0.14);
  white-space: nowrap;
}

.widget-table tbody td {
  padding: 11px 10px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  color: #334155;
  font-size: 14px;
  white-space: nowrap;
}

.widget-table tbody tr:nth-child(even) td {
  background: rgba(248, 250, 252, 0.98);
}

.widget-table tbody tr:hover td {
  background: rgba(79, 70, 229, 0.05);
}

.empty-cell {
  text-align: center;
  color: #64748b;
  font-weight: 600;
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

.status-info {
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.18);
}

.status-warning {
  color: #92400e;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.status-danger {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.18);
}

@media (max-width: 1400px) {
  .dashboard-stats-grid,
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .insight-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .quick-actions-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .alert-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-toolbar-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .hero-content {
    flex-direction: column;
  }

  .hero-highlight-grid {
    min-width: 0;
    width: 100%;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .chart-grid,
  .widget-grid {
    grid-template-columns: 1fr;
  }

  .chart-span-2,
  .widget-card-wide {
    grid-column: span 1;
  }

  .insight-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .quick-actions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard-page {
    gap: 18px;
  }

  .hero-card,
  .panel {
    padding: 16px;
  }

  .hero-content h1 {
    font-size: 28px;
  }

  .hero-highlight-grid,
  .dashboard-stats-grid,
  .stats-grid,
  .insight-grid,
  .quick-actions-grid,
  .alert-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-toolbar-grid {
    grid-template-columns: 1fr;
  }

  .section-top,
  .panel-head,
  .widget-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .mini-chart {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    min-height: auto;
  }

  .chart-bar-item {
    min-height: 190px;
  }
}
</style>
