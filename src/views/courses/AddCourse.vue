<template>
  <div class="course-form-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Courses</p>
        <h2>Add Course</h2>
      </div>

      <router-link to="/courses" class="app-btn app-btn-secondary app-btn-pill">
        Back to List
      </router-link>
    </div>

    <div class="form-card card">
      <form class="course-form" @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label>Course Name</label>
            <select v-model="form.name" class="form-control" @change="handleCourseNameChange">
              <option value="">Select course name</option>
              <option v-for="course in courseNameOptions" :key="course" :value="course">
                {{ course }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Course Code</label>
            <select v-model="form.code" class="form-control">
              <option value="">Select course code</option>
              <option v-for="code in availableCourseCodes" :key="code" :value="code">
                {{ code }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Duration</label>
            <select v-model="form.duration" class="form-control">
              <option value="">Select duration</option>
              <option v-for="duration in durationOptionsList" :key="duration" :value="duration">
                {{ duration }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Fees</label>
            <input
              v-model.number="form.fees"
              type="number"
              min="0"
              placeholder="Enter course fees"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Batch Label</label>
            <select v-model="form.batch" class="form-control">
              <option value="">Select batch label</option>
              <option v-for="batch in batchOptionsList" :key="batch" :value="batch">
                {{ batch }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status" class="form-control">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div class="form-group">
            <label>Trainer</label>
            <select v-model="form.trainer" class="form-control">
              <option value="">Select trainer</option>
              <option v-for="trainer in trainerOptionsList" :key="trainer" :value="trainer">
                {{ trainer }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Assistant Trainer</label>
            <select v-model="form.assistantTrainer" class="form-control">
              <option value="">Select assistant trainer</option>
              <option v-for="trainer in trainerOptionsList" :key="trainer" :value="trainer">
                {{ trainer }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Start Date</label>
            <input v-model="form.startDate" type="date" class="form-control" />
          </div>

          <div class="form-group">
            <label>End Date</label>
            <input v-model="form.endDate" type="date" class="form-control" />
          </div>

          <div class="form-group">
            <label>Max Students</label>
            <input
              v-model.number="form.maxStudents"
              type="number"
              min="1"
              placeholder="Enter max students"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Current Enrolled</label>
            <input :value="0" type="number" class="form-control" disabled />
          </div>

          <div class="form-group form-group-span-3">
            <label>Description</label>
            <textarea
              v-model="form.description"
              rows="5"
              placeholder="Enter course description"
              class="form-control textarea-control"
            ></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="app-btn app-btn-secondary" @click="resetForm">Reset</button>
          <button type="submit" class="app-btn app-btn-primary">Save Course</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  useCourseStore,
  durationOptions,
  trainerOptions,
  type CourseFormData,
} from '@/stores/courseStore'

const router = useRouter()
const courseStore = useCourseStore()
const { addCourse, init } = courseStore

init()

const courseNameOptions = computed(() => [
  'Full Stack Development',
  'Data Science',
  'UI/UX Design',
  'Cyber Security',
  'Digital Marketing',
  'Graphic Design',
  'Tally & GST',
  'MS-CIT Advanced',
  'Web Development',
  'Mobile App Development',
  'Python Programming',
  'Video Editing',
])

const batchOptionsList = computed(() => ['Morning', 'Afternoon', 'Evening'])
const durationOptionsList = computed(() => [...durationOptions])
const trainerOptionsList = computed(() => [...trainerOptions])

const courseCodeMap: Record<string, string> = {
  'Full Stack Development': 'VBC101',
  'Data Science': 'VBC102',
  'UI/UX Design': 'VBC103',
  'Cyber Security': 'VBC104',
  'Digital Marketing': 'VBC105',
  'Graphic Design': 'VBC106',
  'Tally & GST': 'VBC107',
  'MS-CIT Advanced': 'VBC108',
  'Web Development': 'VBC109',
  'Mobile App Development': 'VBC110',
  'Python Programming': 'VBC111',
  'Video Editing': 'VBC112',
}

const availableCourseCodes = computed(() => {
  if (form.name && courseCodeMap[form.name]) {
    return [courseCodeMap[form.name]]
  }

  return Object.values(courseCodeMap)
})

const getDefaultForm = (): CourseFormData => ({
  name: '',
  code: '',
  duration: '',
  fees: 0,
  status: 'Active',
  description: '',
  startDate: '',
  endDate: '',
  maxStudents: 40,
  batch: '',
  trainer: '',
  assistantTrainer: '',
})

const form = reactive<CourseFormData>(getDefaultForm())

const handleCourseNameChange = () => {
  form.code = courseCodeMap[form.name] ?? ''
}

const resetForm = () => {
  Object.assign(form, getDefaultForm())
}

const handleSubmit = () => {
  if (
    !form.name.trim() ||
    !form.code.trim() ||
    !form.duration ||
    !form.batch ||
    !form.trainer ||
    !form.startDate ||
    !form.endDate ||
    !form.maxStudents
  ) {
    alert('Please fill all required fields.')
    return
  }

  if (new Date(form.endDate).getTime() < new Date(form.startDate).getTime()) {
    alert('End date cannot be earlier than start date.')
    return
  }

  addCourse({
    name: form.name.trim(),
    code: form.code.trim().toUpperCase(),
    duration: form.duration,
    fees: Number(form.fees) || 0,
    status: form.status,
    description: form.description.trim(),
    startDate: form.startDate,
    endDate: form.endDate,
    maxStudents: Number(form.maxStudents) || 0,
    batch: form.batch,
    trainer: form.trainer,
    assistantTrainer: form.assistantTrainer,
  })

  router.push('/courses')
}
</script>

<style scoped>
.course-form-page {
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

.form-card {
  border-radius: 24px;
  padding: 24px;
}

.course-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group-span-3 {
  grid-column: span 3;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 8px;
}

@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .form-group-span-3 {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .page-head h2 {
    font-size: 24px;
  }

  .form-card {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-group-span-3 {
    grid-column: span 1;
  }

  .form-actions > * {
    width: 100%;
  }
}
</style>
