<template>
  <div class="attendance-form-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Attendance</p>
        <h2>Mark Attendance</h2>
      </div>

      <router-link to="/attendance" class="app-btn app-btn-secondary app-btn-pill">
        Back to List
      </router-link>
    </div>

    <div class="form-layout">
      <div class="form-card card">
        <form class="attendance-form" @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="form-group">
              <label>Date</label>
              <input v-model="form.date" type="date" class="form-control" />
              <small v-if="errors.date" class="error-text">{{ errors.date }}</small>
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status" class="form-control">
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Leave">Leave</option>
              </select>
              <small v-if="errors.status" class="error-text">{{ errors.status }}</small>
            </div>

            <div class="form-group">
              <label>Course</label>
              <select v-model.number="form.courseId" class="form-control">
                <option :value="0">Select course</option>
                <option v-for="course in courseOptions" :key="course.id" :value="course.id">
                  {{ course.name }}
                </option>
              </select>
              <small v-if="errors.courseId" class="error-text">{{ errors.courseId }}</small>
            </div>

            <div class="form-group">
              <label>Batch</label>
              <select v-model.number="form.batchId" class="form-control" :disabled="!form.courseId">
                <option :value="0">Select batch</option>
                <option v-for="batch in batchOptions" :key="batch.id" :value="batch.id">
                  {{ batch.name }}
                </option>
              </select>
              <small v-if="errors.batchId" class="error-text">{{ errors.batchId }}</small>
            </div>

            <div class="form-group form-group-span-2">
              <label>Student</label>
              <select
                v-model.number="form.studentId"
                class="form-control"
                :disabled="!form.batchId"
              >
                <option :value="0">Select student</option>
                <option v-for="student in studentOptions" :key="student.id" :value="student.id">
                  {{ student.name }} — {{ student.course }} / {{ student.batch }}
                </option>
              </select>
              <small v-if="errors.studentId" class="error-text">{{ errors.studentId }}</small>
            </div>

            <div class="form-group">
              <label>Marked By</label>
              <input
                v-model.trim="form.markedBy"
                type="text"
                class="form-control"
                placeholder="Enter marker name"
              />
            </div>

            <div class="form-group">
              <label>Note</label>
              <input
                v-model.trim="form.note"
                type="text"
                class="form-control"
                placeholder="Optional note"
              />
            </div>
          </div>

          <div v-if="duplicateWarning" class="warning-box">
            This attendance entry already exists for the same date, batch, and student.
          </div>

          <div v-if="linkWarning" class="warning-box soft-warning">
            Selected student is not aligned with the selected course and batch.
          </div>

          <div class="form-actions">
            <button type="button" class="app-btn app-btn-secondary" @click="resetForm">
              Reset
            </button>
            <button type="submit" class="app-btn app-btn-primary">Save Attendance</button>
          </div>
        </form>
      </div>

      <div class="preview-stack">
        <div class="preview-card card">
          <h3>Quick Preview</h3>

          <div class="preview-box">
            <div class="preview-title">{{ selectedStudentName }}</div>
            <div class="preview-sub">{{ selectedCourseName }} • {{ selectedBatchName }}</div>

            <div class="preview-grid">
              <div class="preview-item">
                <label>Date</label>
                <p>{{ form.date || '—' }}</p>
              </div>

              <div class="preview-item">
                <label>Status</label>
                <p>
                  <span class="status-pill" :class="getStatusClass(form.status)">
                    {{ form.status }}
                  </span>
                </p>
              </div>

              <div class="preview-item">
                <label>Marked By</label>
                <p>{{ form.markedBy || 'Admin' }}</p>
              </div>

              <div class="preview-item">
                <label>Note</label>
                <p>{{ form.note || '—' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-card card">
          <h3>Guidelines</h3>
          <ul class="tips-list">
            <li>Select course first, then batch, then student.</li>
            <li>Only linked students for the selected batch are shown.</li>
            <li>Duplicate attendance for same date and student is blocked.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { useBatchesStore } from '@/stores/batchesStore'
import { useCourseStore } from '@/stores/courseStore'
import { useStudentStore } from '@/stores/studentsStore'
import type { AttendanceCreateInput, AttendanceStatus } from '@/types/attendance'

type FormErrors = Partial<Record<'date' | 'courseId' | 'batchId' | 'studentId' | 'status', string>>

const router = useRouter()

const attendanceStore = useAttendanceStore()
const batchStore = useBatchesStore()
const courseStore = useCourseStore()
const studentStore = useStudentStore()

function todayYMD(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const form = reactive<AttendanceCreateInput>({
  date: todayYMD(),
  courseId: 0,
  batchId: 0,
  studentId: 0,
  status: 'Present',
  note: '',
  markedBy: 'Admin',
})

const errors = reactive<FormErrors>({})

onMounted(() => {
  courseStore.init()
  batchStore.init()
  studentStore.init()
  attendanceStore.init()
})

const courseOptions = computed(() => [...courseStore.courses])

const batchOptions = computed(() => {
  if (!form.courseId) return []
  return batchStore.batches.filter((batch) => batch.courseId === form.courseId)
})

const studentOptions = computed(() => {
  if (!form.courseId || !form.batchId) return []
  const selectedCourse = courseStore.getCourseById(form.courseId)
  const selectedBatch = batchStore.getById(form.batchId)
  if (!selectedCourse || !selectedBatch) return []

  return studentStore.students.filter(
    (student) => student.course === selectedCourse.name && student.batch === selectedBatch.name,
  )
})

watch(
  () => form.courseId,
  () => {
    const currentBatch = batchStore.getById(form.batchId)
    if (!currentBatch || currentBatch.courseId !== form.courseId) {
      form.batchId = 0
      form.studentId = 0
    }
  },
)

watch(
  () => form.batchId,
  () => {
    const validStudent = studentOptions.value.some((student) => student.id === form.studentId)
    if (!validStudent) {
      form.studentId = 0
    }
  },
)

const selectedCourse = computed(() => courseStore.getCourseById(form.courseId))
const selectedBatch = computed(() => batchStore.getById(form.batchId))
const selectedStudent = computed(() => studentStore.getStudentById(form.studentId))

const selectedCourseName = computed(() => selectedCourse.value?.name ?? 'Select Course')
const selectedBatchName = computed(() => selectedBatch.value?.name ?? 'Select Batch')
const selectedStudentName = computed(() => selectedStudent.value?.name ?? 'Select Student')

const duplicateWarning = computed(() => {
  if (!form.date || !form.batchId || !form.studentId) return false
  return attendanceStore.hasEntry(form.date, form.batchId, form.studentId)
})

const linkWarning = computed(() => {
  if (!form.courseId || !form.batchId || !form.studentId) return false
  return !attendanceStore.validateLinkedSelection({
    courseId: form.courseId,
    batchId: form.batchId,
    studentId: form.studentId,
  })
})

function getStatusClass(status: AttendanceStatus) {
  if (status === 'Present') return 'status-present'
  if (status === 'Absent') return 'status-absent'
  if (status === 'Late') return 'status-late'
  return 'status-leave'
}

function clearErrors() {
  Object.keys(errors).forEach((key) => delete errors[key as keyof FormErrors])
}

function validate() {
  clearErrors()

  if (!form.date) errors.date = 'Date is required'
  if (!form.status) errors.status = 'Status is required'
  if (!form.courseId) errors.courseId = 'Course is required'
  if (!form.batchId) errors.batchId = 'Batch is required'
  if (!form.studentId) errors.studentId = 'Student is required'

  if (duplicateWarning.value) {
    errors.studentId = 'Duplicate entry exists for the same date and student'
  }

  if (linkWarning.value) {
    errors.studentId = 'Selected student is not linked to selected course and batch'
  }

  return Object.keys(errors).length === 0
}

function resetForm() {
  form.date = todayYMD()
  form.courseId = 0
  form.batchId = 0
  form.studentId = 0
  form.status = 'Present'
  form.note = ''
  form.markedBy = 'Admin'
  clearErrors()
}

function handleSubmit() {
  if (!validate()) return

  const created = attendanceStore.create({
    date: form.date,
    courseId: Number(form.courseId),
    batchId: Number(form.batchId),
    studentId: Number(form.studentId),
    status: form.status,
    note: form.note?.trim() || '',
    markedBy: form.markedBy?.trim() || 'Admin',
  })

  if (!created) {
    errors.studentId = 'Unable to save attendance. Please verify linked course, batch, and student.'
    return
  }

  router.push('/attendance')
}
</script>

<style scoped>
.attendance-form-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.form-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 20px;
}

.form-card,
.preview-card {
  border-radius: 24px;
  padding: 24px;
}

.attendance-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group-span-2 {
  grid-column: span 2;
}

.form-group label {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.form-control {
  min-height: 48px;
  border: 1.5px solid #cbd5e1 !important;
  background: #ffffff !important;
  color: #0f172a !important;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.04);
}

.form-control:hover {
  border-color: #94a3b8 !important;
}

.form-control:focus {
  border-color: #4f46e5 !important;
  box-shadow:
    0 0 0 4px rgba(79, 70, 229, 0.12),
    0 8px 18px rgba(79, 70, 229, 0.08) !important;
}

.error-text {
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
}

.warning-box {
  border-radius: 16px;
  padding: 12px 14px;
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.22);
  color: #9a3412;
  font-size: 13px;
  font-weight: 700;
}

.soft-warning {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.2);
  color: #3730a3;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.preview-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-card h3 {
  font-size: 22px;
  margin-bottom: 16px;
}

.preview-box {
  border-radius: 20px;
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
}

.preview-title {
  font-size: 20px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 6px;
}

.preview-sub {
  color: #64748b;
  font-weight: 600;
  margin-bottom: 16px;
}

.preview-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.preview-item {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: #ffffff;
}

.preview-item label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
}

.preview-item p {
  color: #1e293b;
  font-weight: 700;
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
  color: #9a3412;
  background: rgba(249, 115, 22, 0.14);
  border: 1px solid rgba(249, 115, 22, 0.18);
}

.status-leave {
  color: #3730a3;
  background: rgba(99, 102, 241, 0.14);
  border: 1px solid rgba(99, 102, 241, 0.18);
}

.tips-list {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  font-weight: 600;
}

.tips-list li + li {
  margin-top: 10px;
}

@media (max-width: 1024px) {
  .form-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-head h2 {
    font-size: 24px;
  }

  .form-card,
  .preview-card {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group-span-2 {
    grid-column: span 1;
  }

  .form-actions > * {
    width: 100%;
  }
}
</style>
