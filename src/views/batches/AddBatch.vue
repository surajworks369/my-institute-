<template>
  <div class="batch-form-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Batches</p>
        <h2>Add Batch</h2>
      </div>

      <router-link to="/batches" class="app-btn app-btn-secondary app-btn-pill">
        Back to List
      </router-link>
    </div>

    <div class="batch-form-layout">
      <div class="form-card card">
        <form class="batch-form" @submit.prevent="submit">
          <div class="form-grid">
            <div class="form-group">
              <label>Batch Name</label>
              <select v-model="form.name" class="form-control" @change="handleBatchNameChange">
                <option value="">Select batch name</option>
                <option v-for="batchName in batchNameOptions" :key="batchName" :value="batchName">
                  {{ batchName }}
                </option>
              </select>
              <small v-if="errors.name" class="field-error">{{ errors.name }}</small>
            </div>

            <div class="form-group">
              <label>Batch Code</label>
              <select v-model="form.code" class="form-control">
                <option value="">Select batch code</option>
                <option v-for="code in batchCodeOptions" :key="code" :value="code">
                  {{ code }}
                </option>
              </select>
              <small v-if="errors.code" class="field-error">{{ errors.code }}</small>
            </div>

            <div class="form-group">
              <label>Course</label>
              <select v-model.number="form.courseId" class="form-control" @change="updateBatchCode">
                <option :value="0">Select course</option>
                <option v-for="course in courses" :key="course.id" :value="course.id">
                  {{ course.name }} ({{ course.code || '—' }})
                </option>
              </select>
              <small v-if="errors.courseId" class="field-error">{{ errors.courseId }}</small>
            </div>

            <div class="form-group">
              <label>Status</label>
              <select v-model="form.status" class="form-control">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div class="form-group">
              <label>Start Date</label>
              <input v-model="form.startDate" type="date" class="form-control" />
              <small v-if="errors.startDate" class="field-error">{{ errors.startDate }}</small>
            </div>

            <div class="form-group">
              <label>End Date</label>
              <input v-model="form.endDate" type="date" class="form-control" />
              <small v-if="errors.endDate" class="field-error">{{ errors.endDate }}</small>
            </div>

            <div class="form-group">
              <label>Timing</label>
              <select v-model="form.timing" class="form-control">
                <option value="">Select timing</option>
                <option v-for="timing in timingOptions" :key="timing" :value="timing">
                  {{ timing }}
                </option>
              </select>
              <small v-if="errors.timing" class="field-error">{{ errors.timing }}</small>
            </div>

            <div class="form-group">
              <label>Classroom</label>
              <select v-model="form.classroom" class="form-control">
                <option value="">Select classroom</option>
                <option v-for="classroom in classroomOptions" :key="classroom" :value="classroom">
                  {{ classroom }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Trainer</label>
              <select v-model="form.trainer" class="form-control">
                <option value="">Select trainer</option>
                <option v-for="trainer in trainerOptions" :key="trainer" :value="trainer">
                  {{ trainer }}
                </option>
              </select>
              <small v-if="errors.trainer" class="field-error">{{ errors.trainer }}</small>
            </div>

            <div class="form-group">
              <label>Assistant Trainer</label>
              <select v-model="form.assistantTrainer" class="form-control">
                <option value="">Select assistant trainer</option>
                <option v-for="trainer in trainerOptions" :key="trainer" :value="trainer">
                  {{ trainer }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label>Capacity</label>
              <input
                v-model.number="form.capacity"
                type="number"
                min="1"
                class="form-control"
                placeholder="Enter capacity"
              />
              <small v-if="errors.capacity" class="field-error">{{ errors.capacity }}</small>
            </div>

            <div class="form-group">
              <label>Enrolled</label>
              <input
                v-model.number="form.enrolled"
                type="number"
                min="0"
                class="form-control"
                placeholder="Enter enrolled count"
              />
              <small v-if="errors.enrolled" class="field-error">{{ errors.enrolled }}</small>
            </div>

            <div class="form-group form-group-span-2">
              <label>Days</label>
              <div class="days-box">
                <label v-for="day in dayOptions" :key="day" class="day-chip">
                  <input type="checkbox" :value="day" v-model="form.days" />
                  <span>{{ day }}</span>
                </label>
              </div>
              <small v-if="errors.days" class="field-error">{{ errors.days }}</small>
            </div>

            <div class="form-group form-group-span-2">
              <label>Notes</label>
              <textarea
                v-model.trim="form.notes"
                rows="5"
                class="form-control textarea-control"
                placeholder="Enter additional notes"
              ></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="app-btn app-btn-secondary" @click="reset">Reset</button>
            <button type="submit" class="app-btn app-btn-primary">Save Batch</button>
          </div>
        </form>
      </div>

      <div class="side-panel">
        <div class="preview-card card">
          <div class="side-title-wrap">
            <p class="side-eyebrow">Preview</p>
            <h3>Quick Summary</h3>
          </div>

          <div class="preview-name">{{ form.name || 'Batch Name' }}</div>
          <div class="preview-meta">{{ form.code || 'CODE' }} • {{ selectedCourseName }}</div>

          <div class="preview-grid">
            <div class="preview-box">
              <label>Dates</label>
              <p>{{ form.startDate || '—' }} → {{ form.endDate || '—' }}</p>
            </div>

            <div class="preview-box">
              <label>Timing</label>
              <p>{{ form.timing || '—' }}</p>
            </div>

            <div class="preview-box">
              <label>Days</label>
              <p>{{ safeDaysText }}</p>
            </div>

            <div class="preview-box">
              <label>Trainer</label>
              <p>{{ form.trainer || '—' }}</p>
            </div>

            <div class="preview-box">
              <label>Seats</label>
              <p>{{ form.enrolled }} / {{ form.capacity }}</p>
            </div>

            <div class="preview-box">
              <label>Status</label>
              <p>{{ form.status }}</p>
            </div>
          </div>
        </div>

        <div class="tips-card card">
          <div class="side-title-wrap">
            <p class="side-eyebrow">Notes</p>
            <h3>Important Tips</h3>
          </div>

          <ul class="tips-list">
            <li>Batch names are fixed as Morning, Afternoon, and Evening.</li>
            <li>Batch code is auto-generated from course and batch type.</li>
            <li>Enrolled count cannot be greater than capacity.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useBatchesStore } from '@/stores/batchesStore'
import { useCourseStore } from '@/stores/courseStore'
import type { BatchCreateInput } from '@/types/batch'

type FormErrors = Partial<
  Record<
    | 'name'
    | 'code'
    | 'courseId'
    | 'startDate'
    | 'endDate'
    | 'timing'
    | 'days'
    | 'trainer'
    | 'capacity'
    | 'enrolled',
    string
  >
>

const router = useRouter()
const batchStore = useBatchesStore()
const courseStore = useCourseStore()

const timingOptions = [
  '08:00 AM - 10:00 AM',
  '10:30 AM - 12:30 PM',
  '02:00 PM - 04:00 PM',
  '04:30 PM - 06:30 PM',
  '07:00 PM - 09:00 PM',
] as const

const classroomOptions = ['Lab-1', 'Lab-2', 'Room-101', 'Room-204', 'Room-305'] as const

const trainerOptions = [
  'Amit Sir',
  'Priya Ma’am',
  'Rahul Sir',
  'Sneha Ma’am',
  'Kiran Sir',
  'Pooja Ma’am',
] as const

const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const batchNameOptions = ['Morning', 'Afternoon', 'Evening'] as const

const form = reactive<BatchCreateInput>({
  name: '',
  code: '',
  courseId: 0,
  startDate: '',
  endDate: '',
  timing: '',
  days: [],
  trainer: '',
  assistantTrainer: '',
  capacity: 30,
  enrolled: 0,
  classroom: '',
  status: 'Active',
  notes: '',
})

const errors = reactive<FormErrors>({})

onMounted(() => {
  courseStore.init()
  batchStore.init()
})

const courses = computed(() => courseStore.courses ?? [])

const selectedCourseName = computed(() => {
  const course = courseStore.getCourseById(form.courseId)
  return course?.name ?? 'Select Course'
})

const safeDaysText = computed(() => {
  return form.days && form.days.length ? form.days.join(', ') : '—'
})

const getBatchShortCode = (batchName: string) => {
  if (batchName === 'Morning') return 'MOR'
  if (batchName === 'Afternoon') return 'AFT'
  if (batchName === 'Evening') return 'EVE'
  return 'BAT'
}

const batchCodeOptions = computed(() => {
  const course = courseStore.getCourseById(form.courseId)
  const courseCode = course?.code?.trim() || 'CRS'

  return batchNameOptions.map((batchName) => `${courseCode}-${getBatchShortCode(batchName)}`)
})

const updateBatchCode = () => {
  if (!form.name) {
    form.code = ''
    return
  }

  const course = courseStore.getCourseById(form.courseId)
  const courseCode = course?.code?.trim() || 'CRS'
  form.code = `${courseCode}-${getBatchShortCode(form.name)}`
}

const handleBatchNameChange = () => {
  updateBatchCode()
}

const reset = () => {
  form.name = ''
  form.code = ''
  form.courseId = 0
  form.startDate = ''
  form.endDate = ''
  form.timing = ''
  form.days = []
  form.trainer = ''
  form.assistantTrainer = ''
  form.capacity = 30
  form.enrolled = 0
  form.classroom = ''
  form.status = 'Active'
  form.notes = ''
  clearErrors()
}

const clearErrors = () => {
  Object.keys(errors).forEach((key) => delete errors[key as keyof FormErrors])
}

const validate = () => {
  clearErrors()

  if (!form.name.trim()) errors.name = 'Batch name is required.'
  if (!form.code.trim()) errors.code = 'Batch code is required.'
  if (!form.courseId || form.courseId <= 0) errors.courseId = 'Course selection is required.'
  if (!form.startDate) errors.startDate = 'Start date is required.'
  if (!form.endDate) errors.endDate = 'End date is required.'

  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    errors.endDate = 'End date must be after start date.'
  }

  if (!form.timing.trim()) errors.timing = 'Timing is required.'
  if (!form.days.length) errors.days = 'Select at least one day.'
  if (!form.trainer.trim()) errors.trainer = 'Trainer is required.'

  if (!Number.isFinite(form.capacity) || form.capacity <= 0) {
    errors.capacity = 'Capacity must be greater than 0.'
  }

  if (!Number.isFinite(form.enrolled) || form.enrolled < 0) {
    errors.enrolled = 'Enrolled must be 0 or greater.'
  }

  if (form.enrolled > form.capacity) {
    errors.enrolled = 'Enrolled cannot be greater than capacity.'
  }

  return Object.keys(errors).length === 0
}

const submit = () => {
  if (!validate()) return

  batchStore.create({
    ...form,
    name: form.name.trim(),
    code: form.code.trim().toUpperCase(),
    timing: form.timing.trim(),
    trainer: form.trainer.trim(),
    assistantTrainer: form.assistantTrainer.trim(),
    classroom: form.classroom.trim(),
    notes: form.notes.trim(),
    enrolled: Math.min(form.enrolled, form.capacity),
  })

  router.push('/batches')
}
</script>

<style scoped>
.batch-form-page {
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

.batch-form-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: 20px;
}

.form-card,
.preview-card,
.tips-card {
  border-radius: 24px;
  padding: 24px;
}

.batch-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.days-box {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  border-radius: 16px;
  border: 1px dashed rgba(99, 102, 241, 0.28);
  background: rgba(79, 70, 229, 0.03);
}

.day-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 38px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  font-weight: 700;
  font-size: 12px;
}

.day-chip input {
  accent-color: #4f46e5;
}

.field-error {
  font-size: 12px;
  font-weight: 700;
  color: #dc2626;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 8px;
}

.side-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.side-title-wrap {
  margin-bottom: 14px;
}

.side-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 6px;
}

.side-title-wrap h3 {
  font-size: 22px;
  font-weight: 800;
}

.preview-name {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 6px;
}

.preview-meta {
  font-size: 14px;
  color: #64748b;
  font-weight: 700;
  margin-bottom: 16px;
}

.preview-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.preview-box {
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.preview-box label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #64748b;
  margin-bottom: 6px;
}

.preview-box p {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.5;
}

.tips-list {
  margin: 0;
  padding-left: 18px;
  color: #475569;
}

.tips-list li {
  margin: 10px 0;
  font-weight: 600;
  line-height: 1.5;
}

@media (max-width: 1100px) {
  .batch-form-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-head h2 {
    font-size: 24px;
  }

  .form-card,
  .preview-card,
  .tips-card {
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
