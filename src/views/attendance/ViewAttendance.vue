<template>
  <div class="view-attendance-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Attendance</p>
        <h2>Attendance Details</h2>
      </div>

      <div class="head-actions">
        <router-link to="/attendance" class="app-btn app-btn-secondary app-btn-pill">
          Back to List
        </router-link>

        <button class="app-btn app-btn-primary app-btn-pill" @click="goEdit" :disabled="!record">
          Edit Attendance
        </button>
      </div>
    </div>

    <div v-if="!record" class="not-found card">Attendance record not found.</div>

    <div v-else class="details-layout">
      <div class="profile-card card">
        <div class="profile-top">
          <div class="avatar">🗓️</div>
          <div class="profile-badge">Attendance Record</div>
        </div>

        <h3>{{ studentName }}</h3>
        <p>{{ courseName }}</p>

        <span class="status-pill" :class="getStatusClass(record.status)">
          {{ record.status }}
        </span>
      </div>

      <div class="details-stack">
        <div class="details-card card">
          <h3>Attendance Information</h3>

          <div class="details-grid">
            <div class="info-box">
              <label>ID</label>
              <p>#{{ record.id }}</p>
            </div>

            <div class="info-box">
              <label>Date</label>
              <p>{{ formatDate(record.date) }}</p>
            </div>

            <div class="info-box">
              <label>Student</label>
              <p>{{ studentName }}</p>
            </div>

            <div class="info-box">
              <label>Status</label>
              <p>{{ record.status }}</p>
            </div>
          </div>
        </div>

        <div class="details-card card">
          <h3>Academic Mapping</h3>

          <div class="details-grid">
            <div class="info-box">
              <label>Course</label>
              <p>{{ courseName }}</p>
            </div>

            <div class="info-box">
              <label>Batch</label>
              <p>{{ batchName }}</p>
            </div>

            <div class="info-box">
              <label>Marked By</label>
              <p>{{ record.markedBy || 'Admin' }}</p>
            </div>

            <div class="info-box">
              <label>Note</label>
              <p>{{ record.note || '—' }}</p>
            </div>
          </div>
        </div>

        <div class="details-card card">
          <h3>Audit Meta</h3>

          <div class="details-grid">
            <div class="info-box">
              <label>Created At</label>
              <p>{{ formatDateTime(record.createdAt) }}</p>
            </div>

            <div class="info-box">
              <label>Updated At</label>
              <p>{{ formatDateTime(record.updatedAt) }}</p>
            </div>
          </div>
        </div>

        <div class="details-card card danger-card">
          <h3>Danger Zone</h3>

          <div class="danger-box">
            <p>Delete this attendance record permanently from the system.</p>
            <button class="app-btn app-btn-danger" @click="handleDelete">Delete Record</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { useBatchesStore } from '@/stores/batchesStore'
import { useCourseStore } from '@/stores/courseStore'
import { useStudentStore } from '@/stores/studentsStore'
import type { AttendanceStatus } from '@/types/attendance'

const route = useRoute()
const router = useRouter()

const attendanceStore = useAttendanceStore()
const batchStore = useBatchesStore()
const courseStore = useCourseStore()
const studentStore = useStudentStore()

const id = Number(route.params.id)

onMounted(() => {
  courseStore.init()
  batchStore.init()
  studentStore.init()
  attendanceStore.init()
})

const record = computed(() => attendanceStore.getById(id))

const studentName = computed(() => {
  if (!record.value) return '—'
  return (
    studentStore.getStudentById(record.value.studentId)?.name ?? `Student ${record.value.studentId}`
  )
})

const courseName = computed(() => {
  if (!record.value) return '—'
  const directCourse = courseStore.getCourseById(record.value.courseId)
  if (directCourse) return directCourse.name

  const student = studentStore.getStudentById(record.value.studentId)
  return student?.course ?? 'Unknown Course'
})

const batchName = computed(() => {
  if (!record.value) return '—'
  const directBatch = batchStore.getById(record.value.batchId)
  if (directBatch) return directBatch.name

  const student = studentStore.getStudentById(record.value.studentId)
  return student?.batch ?? 'Unknown Batch'
})

function getStatusClass(status: AttendanceStatus) {
  if (status === 'Present') return 'status-present'
  if (status === 'Absent') return 'status-absent'
  if (status === 'Late') return 'status-late'
  return 'status-leave'
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB')
}

function formatDateTime(value: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-GB')
}

function goEdit() {
  if (!record.value) return
  router.push(`/attendance/edit/${record.value.id}`)
}

function handleDelete() {
  if (!record.value) return
  const confirmed = window.confirm('Are you sure you want to delete this attendance record?')
  if (!confirmed) return

  attendanceStore.remove(record.value.id)
  router.push('/attendance')
}
</script>

<style scoped>
.view-attendance-page {
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

.details-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
}

.details-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card,
.details-card,
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
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: white;
  font-size: 34px;
  font-weight: 800;
  box-shadow: 0 16px 30px rgba(59, 130, 246, 0.2);
}

.profile-badge {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.1);
  color: #4338ca;
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

.details-card h3 {
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

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  padding: 8px 14px;
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
  color: #9a3412;
  background: rgba(249, 115, 22, 0.14);
  border: 1px solid rgba(249, 115, 22, 0.18);
}

.status-leave {
  color: #3730a3;
  background: rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(99, 102, 241, 0.18);
}

.danger-card {
  border-color: rgba(239, 68, 68, 0.18);
}

.danger-box {
  padding: 16px;
  border-radius: 18px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.16);
  color: #7f1d1d;
}

.danger-box p {
  margin-bottom: 12px;
  font-weight: 600;
}

.not-found {
  font-weight: 700;
  color: #b91c1c;
}

@media (max-width: 992px) {
  .details-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-head h2 {
    font-size: 24px;
  }

  .profile-card,
  .details-card,
  .not-found {
    padding: 16px;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .head-actions {
    width: 100%;
  }

  .head-actions > * {
    width: 100%;
  }
}
</style>
