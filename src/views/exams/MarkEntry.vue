<template>
  <div class="mark-entry-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Exam Marks</p>
        <h2>{{ isEdit ? 'Edit Mark Entry' : 'Add Mark Entry' }}</h2>
      </div>

      <router-link :to="backLink" class="app-btn app-btn-secondary app-btn-pill">
        Back
      </router-link>
    </div>

    <div v-if="notFound" class="not-found card">Mark entry not found.</div>

    <div v-else class="form-layout">
      <div class="form-card card">
        <form class="mark-form" @submit.prevent="handleSubmit">
          <div class="form-grid">
            <div class="form-group">
              <label>Exam</label>
              <select v-model.number="form.examId" class="form-control" :disabled="isEdit">
                <option :value="0">Select exam</option>
                <option v-for="exam in exams" :key="exam.id" :value="exam.id">
                  {{ exam.name }} ({{ exam.code }}) • {{ exam.examDate }}
                </option>
              </select>
              <small v-if="errors.examId" class="error-text">{{ errors.examId }}</small>
            </div>

            <div class="form-group">
              <label>Student</label>
              <select
                v-model.number="form.studentId"
                class="form-control"
                :disabled="isEdit || !selectedExam"
              >
                <option :value="0">Select student</option>
                <option v-for="student in linkedStudents" :key="student.id" :value="student.id">
                  {{ student.name }} — {{ student.batch }}
                </option>
              </select>
              <small v-if="errors.studentId" class="error-text">{{ errors.studentId }}</small>
            </div>

            <div class="form-group">
              <label>Obtained Marks</label>
              <input
                v-model.number="form.obtainedMarks"
                type="number"
                min="0"
                :max="selectedExam?.totalMarks ?? 100"
                class="form-control"
              />
              <small class="helper-text">
                Total: <b>{{ selectedExam?.totalMarks ?? '—' }}</b> • Passing:
                <b>{{ selectedExam?.passingMarks ?? '—' }}</b>
              </small>
              <small v-if="errors.obtainedMarks" class="error-text">{{
                errors.obtainedMarks
              }}</small>
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status" class="form-control">
                <option value="">Auto (recommended)</option>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
              </select>
              <small class="helper-text">Auto calculates from obtained vs passing marks</small>
            </div>

            <div class="form-group">
              <label>Checked By</label>
              <input
                v-model.trim="form.checkedBy"
                class="form-control"
                placeholder="Enter checker name"
              />
              <small v-if="errors.checkedBy" class="error-text">{{ errors.checkedBy }}</small>
            </div>

            <div class="form-group form-group-span-2">
              <label>Note</label>
              <textarea
                v-model.trim="form.note"
                rows="5"
                class="form-control textarea-control"
                placeholder="Optional note"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button v-if="isEdit" type="button" class="app-btn app-btn-danger" @click="deleteEntry">
              Delete
            </button>
            <div class="spacer"></div>
            <router-link :to="backLink" class="app-btn app-btn-secondary">Cancel</router-link>
            <button type="submit" class="app-btn app-btn-primary">
              {{ isEdit ? 'Update Mark Entry' : 'Save Mark Entry' }}
            </button>
          </div>
        </form>
      </div>

      <div class="preview-stack">
        <div class="preview-card card">
          <h3>Quick Preview</h3>

          <div class="preview-box">
            <div class="preview-title">{{ selectedExam?.name || 'Select Exam' }}</div>
            <div class="preview-sub">{{ selectedStudentName }}</div>

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
                <label>Obtained</label>
                <p>{{ safeObtainedMarks }}/{{ selectedExam?.totalMarks ?? '—' }}</p>
              </div>

              <div class="preview-item">
                <label>Result</label>
                <p>
                  <span
                    class="result-pill"
                    :class="previewStatus === 'Pass' ? 'result-pass' : 'result-fail'"
                  >
                    {{ previewStatus }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-card card">
          <h3>Rules</h3>
          <ul class="tips-list">
            <li>Only students linked to the selected exam batch are shown.</li>
            <li>Duplicate entry for same exam and student is blocked.</li>
            <li>Marks are clamped automatically to exam total marks.</li>
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
import { useStudentStore } from '@/stores/studentsStore'
import type { ExamMark, PassFail } from '@/types/exam'

type FormErrors = Partial<Record<'examId' | 'studentId' | 'obtainedMarks' | 'checkedBy', string>>

type MarkForm = {
  examId: number
  studentId: number
  obtainedMarks: number
  status: '' | PassFail
  checkedBy: string
  note: string
}

const route = useRoute()
const router = useRouter()

const examStore = useExamStore()
const batchStore = useBatchesStore()
const courseStore = useCourseStore()
const studentStore = useStudentStore()

const isEdit = computed(() => route.path.includes('/marks/edit/'))
const markId = computed(() => Number(route.params.id || 0))
const notFound = ref(false)

const form = reactive<MarkForm>({
  examId: 0,
  studentId: 0,
  obtainedMarks: 0,
  status: '',
  checkedBy: 'Admin',
  note: '',
})

const errors = reactive<FormErrors>({})

onMounted(() => {
  batchStore.init()
  courseStore.init()
  studentStore.init()
  examStore.init()

  if (isEdit.value) {
    const mark = examStore.getMarkById(markId.value)
    if (!mark) {
      notFound.value = true
      return
    }
    hydrateForm(mark)
  } else {
    const queryExamId = Number(route.query.examId || 0)
    if (queryExamId > 0) form.examId = queryExamId
  }
})

watch(
  () => form.examId,
  () => {
    if (isEdit.value) return
    const studentStillValid = linkedStudents.value.some((student) => student.id === form.studentId)
    if (!studentStillValid) {
      form.studentId = 0
    }
  },
)

const exams = computed(() => [...examStore.exams])
const selectedExam = computed(() => examStore.getExamById(form.examId))

const linkedStudents = computed(() => {
  if (!selectedExam.value) return []
  return studentStore.students.filter((student) =>
    examStore.isStudentLinkedToExam(student, selectedExam.value!),
  )
})

const selectedStudentName = computed(() => {
  return studentStore.getStudentById(form.studentId)?.name ?? 'Select Student'
})

const selectedCourseName = computed(() => {
  if (!selectedExam.value) return '—'
  return courseStore.getCourseById(selectedExam.value.courseId)?.name ?? '—'
})

const selectedBatchName = computed(() => {
  if (!selectedExam.value) return '—'
  return batchStore.getById(selectedExam.value.batchId)?.name ?? '—'
})

const safeObtainedMarks = computed(() => {
  const total = selectedExam.value?.totalMarks ?? 100
  const val = Number(form.obtainedMarks)
  if (!Number.isFinite(val)) return 0
  return Math.max(0, Math.min(val, total))
})

const previewStatus = computed<PassFail>(() => {
  if (!selectedExam.value) return 'Fail'
  if (form.status === 'Pass' || form.status === 'Fail') return form.status
  return safeObtainedMarks.value >= selectedExam.value.passingMarks ? 'Pass' : 'Fail'
})

const backLink = computed(() => {
  if (form.examId > 0) return `/exams/view/${form.examId}`
  return '/exams'
})

function hydrateForm(mark: ExamMark) {
  form.examId = mark.examId
  form.studentId = mark.studentId
  form.obtainedMarks = Number(mark.obtainedMarks)
  form.status = mark.status
  form.checkedBy = mark.checkedBy || 'Admin'
  form.note = mark.note || ''
}

function clearErrors() {
  Object.keys(errors).forEach((key) => delete errors[key as keyof FormErrors])
}

function validate() {
  clearErrors()

  if (!form.examId) errors.examId = 'Exam is required'
  if (!form.studentId) errors.studentId = 'Student is required'

  const exam = selectedExam.value
  if (!exam) errors.examId = errors.examId ?? 'Valid exam is required'

  if (exam) {
    if (!examStore.validateMarkLink(form.examId, form.studentId)) {
      errors.studentId = 'Selected student is not linked to this exam batch'
    }

    if (!isEdit.value && examStore.hasMarkEntry(form.examId, form.studentId)) {
      errors.studentId = 'This student already has marks entry for this exam'
    }

    if (safeObtainedMarks.value < 0 || safeObtainedMarks.value > exam.totalMarks) {
      errors.obtainedMarks = `Obtained marks must be between 0 and ${exam.totalMarks}`
    }
  }

  if (form.checkedBy.length > 40) {
    errors.checkedBy = 'Checked by is too long'
  }

  return Object.keys(errors).length === 0
}

function handleSubmit() {
  if (!validate()) return
  if (!selectedExam.value) return

  if (!isEdit.value) {
    const created = examStore.createMark({
      examId: form.examId,
      studentId: form.studentId,
      batchId: selectedExam.value.batchId,
      obtainedMarks: safeObtainedMarks.value,
      status: form.status === '' ? undefined : form.status,
      checkedBy: form.checkedBy || 'Admin',
      note: form.note,
    })

    if (!created) {
      errors.studentId = 'Unable to create mark entry. Please verify exam and student link.'
      return
    }

    router.push(`/exams/view/${form.examId}`)
    return
  }

  const updated = examStore.updateMark(markId.value, {
    obtainedMarks: safeObtainedMarks.value,
    status: form.status === '' ? undefined : form.status,
    checkedBy: form.checkedBy || 'Admin',
    note: form.note,
  })

  if (!updated) {
    errors.studentId = 'Unable to update mark entry.'
    return
  }

  router.push(`/exams/view/${form.examId}`)
}

function deleteEntry() {
  const confirmed = window.confirm('Delete this mark entry?')
  if (!confirmed) return
  examStore.removeMark(markId.value)
  router.push(`/exams/view/${form.examId}`)
}
</script>

<style scoped>
.mark-entry-page {
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

.mark-form {
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

.helper-text {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
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

.result-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}

.result-pass {
  color: #065f46;
  background: rgba(16, 185, 129, 0.14);
}
.result-fail {
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
