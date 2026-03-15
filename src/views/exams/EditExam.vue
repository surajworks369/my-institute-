<template>
  <div class="exam-form-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Exams</p>
        <h2>Edit Exam</h2>
      </div>

      <router-link to="/exams" class="app-btn app-btn-secondary app-btn-pill">
        Back to List
      </router-link>
    </div>

    <div v-if="!examFound" class="not-found card">Exam not found.</div>

    <div v-else class="form-layout">
      <div class="form-card card">
        <form class="exam-form" @submit.prevent="handleUpdate">
          <div class="form-grid">
            <div class="form-group">
              <label>Exam Name</label>
              <input v-model.trim="form.name" class="form-control" />
              <small v-if="errors.name" class="error-text">{{ errors.name }}</small>
            </div>

            <div class="form-group">
              <label>Exam Code</label>
              <input v-model.trim="form.code" class="form-control" />
              <small v-if="errors.code" class="error-text">{{ errors.code }}</small>
            </div>

            <div class="form-group">
              <label>Course</label>
              <select v-model.number="form.courseId" class="form-control">
                <option :value="0">Select course</option>
                <option v-for="course in courses" :key="course.id" :value="course.id">
                  {{ course.name }} ({{ course.code }})
                </option>
              </select>
              <small v-if="errors.courseId" class="error-text">{{ errors.courseId }}</small>
            </div>

            <div class="form-group">
              <label>Batch</label>
              <select v-model.number="form.batchId" class="form-control" :disabled="!form.courseId">
                <option :value="0">Select batch</option>
                <option v-for="batch in filteredBatches" :key="batch.id" :value="batch.id">
                  {{ batch.name }} ({{ batch.code }})
                </option>
              </select>
              <small v-if="errors.batchId" class="error-text">{{ errors.batchId }}</small>
            </div>

            <div class="form-group">
              <label>Exam Type</label>
              <select v-model="form.type" class="form-control">
                <option v-for="type in examTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status" class="form-control">
                <option v-for="status in examStatuses" :key="status" :value="status">
                  {{ status }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Exam Date</label>
              <input v-model="form.examDate" type="date" class="form-control" />
              <small v-if="errors.examDate" class="error-text">{{ errors.examDate }}</small>
            </div>

            <div class="form-group">
              <label>Start Time</label>
              <input v-model="form.startTime" type="time" class="form-control" />
              <small v-if="errors.startTime" class="error-text">{{ errors.startTime }}</small>
            </div>

            <div class="form-group">
              <label>End Time</label>
              <input v-model="form.endTime" type="time" class="form-control" />
              <small v-if="errors.endTime" class="error-text">{{ errors.endTime }}</small>
            </div>

            <div class="form-group">
              <label>Total Marks</label>
              <input v-model.number="form.totalMarks" type="number" min="1" class="form-control" />
              <small v-if="errors.totalMarks" class="error-text">{{ errors.totalMarks }}</small>
            </div>

            <div class="form-group">
              <label>Passing Marks</label>
              <input
                v-model.number="form.passingMarks"
                type="number"
                min="0"
                class="form-control"
              />
              <small v-if="errors.passingMarks" class="error-text">{{ errors.passingMarks }}</small>
            </div>

            <div class="form-group form-group-span-2">
              <label>Instructions</label>
              <textarea
                v-model.trim="form.instructions"
                rows="5"
                class="form-control textarea-control"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="app-btn app-btn-danger" @click="deleteExam">Delete</button>
            <div class="spacer"></div>
            <router-link to="/exams" class="app-btn app-btn-secondary">Cancel</router-link>
            <button type="submit" class="app-btn app-btn-primary">Update Exam</button>
          </div>
        </form>
      </div>

      <div class="preview-stack">
        <div class="preview-card card">
          <h3>Quick Preview</h3>

          <div class="preview-box">
            <div class="preview-title">{{ form.name || 'Exam Name' }}</div>
            <div class="preview-sub">{{ form.code || 'Exam Code' }}</div>

            <div class="preview-grid">
              <div class="preview-item">
                <label>Course</label>
                <p>{{ selectedCourseName }}</p>
              </div>

              <div class="preview-item">
                <label>Batch</label>
                <p>{{ selectedBatchName }}</p>
              </div>

              <div class="preview-item">
                <label>Date</label>
                <p>{{ form.examDate || '—' }}</p>
              </div>

              <div class="preview-item">
                <label>Status</label>
                <p>
                  <span class="status-pill" :class="getStatusClass(form.status)">
                    {{ form.status }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-card card">
          <h3>Impact Note</h3>
          <ul class="tips-list">
            <li>Changing batch/course may drop invalid marks entries automatically.</li>
            <li>Updated total marks will re-clamp existing marks.</li>
            <li>Passing marks change will recalculate pass/fail results.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore } from '@/stores/examStore'
import { useBatchesStore } from '@/stores/batchesStore'
import { useCourseStore } from '@/stores/courseStore'
import {
  EXAM_STATUSES,
  EXAM_TYPES,
  type ExamStatus,
  type ExamType,
  type ExamUpdateInput,
} from '@/types/exam'

type FormErrors = Partial<
  Record<
    | 'name'
    | 'code'
    | 'courseId'
    | 'batchId'
    | 'examDate'
    | 'startTime'
    | 'endTime'
    | 'totalMarks'
    | 'passingMarks',
    string
  >
>

const route = useRoute()
const router = useRouter()

const examStore = useExamStore()
const batchStore = useBatchesStore()
const courseStore = useCourseStore()

const id = Number(route.params.id)
const examFound = ref(true)

const form = reactive<ExamUpdateInput>({
  name: '',
  code: '',
  courseId: 0,
  batchId: 0,
  type: 'Unit' as ExamType,
  status: 'Upcoming' as ExamStatus,
  examDate: '',
  startTime: '',
  endTime: '',
  totalMarks: 100,
  passingMarks: 35,
  instructions: '',
})

const errors = reactive<FormErrors>({})

onMounted(() => {
  batchStore.init()
  courseStore.init()
  examStore.init()

  const exam = examStore.getExamById(id)
  if (!exam) {
    examFound.value = false
    return
  }

  Object.assign(form, exam)
})

watch(
  () => form.courseId,
  () => {
    const batch = batchStore.getById(Number(form.batchId ?? 0))
    if (!batch || batch.courseId !== Number(form.courseId ?? 0)) {
      form.batchId = 0
    }
  },
)

const courses = computed(() => [...courseStore.courses])
const examTypes = EXAM_TYPES
const examStatuses = EXAM_STATUSES

const filteredBatches = computed(() => {
  if (!form.courseId) return []
  return batchStore.batches.filter((batch) => batch.courseId === Number(form.courseId))
})

const selectedCourseName = computed(
  () => courseStore.getCourseById(Number(form.courseId ?? 0))?.name ?? 'Select Course',
)
const selectedBatchName = computed(
  () => batchStore.getById(Number(form.batchId ?? 0))?.name ?? 'Select Batch',
)

function getStatusClass(status: ExamStatus | undefined) {
  if (status === 'Upcoming') return 'status-upcoming'
  if (status === 'Ongoing') return 'status-ongoing'
  if (status === 'Completed') return 'status-completed'
  return 'status-cancelled'
}

function clearErrors() {
  Object.keys(errors).forEach((key) => delete errors[key as keyof FormErrors])
}

function validate() {
  clearErrors()

  if (!String(form.name ?? '').trim()) errors.name = 'Exam name is required'
  if (!String(form.code ?? '').trim()) errors.code = 'Exam code is required'
  if (!Number(form.courseId)) errors.courseId = 'Course is required'
  if (!Number(form.batchId)) errors.batchId = 'Batch is required'
  if (!String(form.examDate ?? '')) errors.examDate = 'Exam date is required'
  if (!String(form.startTime ?? '')) errors.startTime = 'Start time is required'
  if (!String(form.endTime ?? '')) errors.endTime = 'End time is required'

  if (
    String(form.startTime ?? '') &&
    String(form.endTime ?? '') &&
    String(form.endTime) <= String(form.startTime)
  ) {
    errors.endTime = 'End time must be after start time'
  }

  if (!Number.isFinite(Number(form.totalMarks)) || Number(form.totalMarks) <= 0) {
    errors.totalMarks = 'Total marks must be greater than 0'
  }

  if (!Number.isFinite(Number(form.passingMarks)) || Number(form.passingMarks) < 0) {
    errors.passingMarks = 'Passing marks must be 0 or more'
  }

  if (Number(form.passingMarks) > Number(form.totalMarks)) {
    errors.passingMarks = 'Passing marks cannot be greater than total marks'
  }

  if (
    Number(form.courseId) &&
    Number(form.batchId) &&
    !examStore.validateExamLink(Number(form.courseId), Number(form.batchId))
  ) {
    errors.batchId = 'Selected batch is not linked to selected course'
  }

  return Object.keys(errors).length === 0
}

function handleUpdate() {
  if (!validate()) return

  const updated = examStore.updateExam(id, {
    ...form,
    name: String(form.name ?? '').trim(),
    code: String(form.code ?? '')
      .trim()
      .toUpperCase(),
    courseId: Number(form.courseId),
    batchId: Number(form.batchId),
    totalMarks: Number(form.totalMarks),
    passingMarks: Number(form.passingMarks),
    instructions: String(form.instructions ?? '').trim(),
  })

  if (!updated) {
    errors.batchId = 'Unable to update exam. Please verify course and batch mapping.'
    return
  }

  router.push('/exams')
}

function deleteExam() {
  const confirmed = window.confirm('Delete this exam? Related marks entries will also be removed.')
  if (!confirmed) return
  examStore.removeExam(id)
  router.push('/exams')
}
</script>

<style scoped>
.exam-form-page {
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
.preview-card,
.not-found {
  border-radius: 24px;
  padding: 24px;
}

.exam-form {
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

.textarea-control {
  min-height: 120px;
  resize: vertical;
  padding-top: 12px;
}

.error-text {
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.spacer {
  flex: 1;
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
  min-width: 90px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.status-upcoming {
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.14);
}
.status-ongoing {
  color: #9a3412;
  background: rgba(249, 115, 22, 0.14);
}
.status-completed {
  color: #065f46;
  background: rgba(16, 185, 129, 0.14);
}
.status-cancelled {
  color: #991b1b;
  background: rgba(239, 68, 68, 0.14);
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

.not-found {
  font-weight: 700;
  color: #b91c1c;
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
  .preview-card,
  .not-found {
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

  .spacer {
    display: none;
  }
}
</style>
