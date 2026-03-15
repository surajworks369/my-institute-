<template>
  <div class="student-form-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Students</p>
        <h2>Add Student</h2>
      </div>

      <router-link to="/students" class="app-btn app-btn-secondary app-btn-pill">
        Back to List
      </router-link>
    </div>

    <div class="form-card card">
      <form class="student-form" @submit.prevent="handleSubmit">
        <div class="form-grid">
          <div class="form-group">
            <label>Full Name</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Enter student full name"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="Enter student email"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Phone</label>
            <input
              v-model="form.phone"
              type="text"
              maxlength="10"
              placeholder="Enter phone number"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label>Course</label>
            <select v-model="form.course" class="form-control">
              <option value="">Select course</option>
              <option v-for="course in courseOptions" :key="course" :value="course">
                {{ course }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Batch</label>
            <select v-model="form.batch" class="form-control" :disabled="!form.course">
              <option value="">{{ form.course ? 'Select batch' : 'Select course first' }}</option>
              <option v-for="batch in batchOptions" :key="batch" :value="batch">
                {{ batch }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Gender</label>
            <select v-model="form.gender" class="form-control">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label>City</label>
            <select v-model="form.city" class="form-control">
              <option value="">Select city</option>
              <option v-for="city in cityList" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Admission Date</label>
            <input v-model="form.admissionDate" type="date" class="form-control" />
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status" class="form-control">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="app-btn app-btn-secondary" @click="resetForm">Reset</button>
          <button type="submit" class="app-btn app-btn-primary">Save Student</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/studentsStore'
import type { StudentFormData } from '@/types/student'

const router = useRouter()
const studentStore = useStudentStore()
const { addStudent, cityList, init, getCourseOptions, getBatchOptions } = studentStore

init()

const getDefaultForm = (): StudentFormData => ({
  name: '',
  email: '',
  phone: '',
  course: '',
  batch: '',
  gender: 'Male',
  city: '',
  admissionDate: '',
  status: 'Active',
})

const form = reactive<StudentFormData>(getDefaultForm())

const courseOptions = computed(() => getCourseOptions())
const batchOptions = computed(() => getBatchOptions(form.course))

watch(
  () => form.course,
  () => {
    form.batch = ''
  },
)

const resetForm = () => {
  Object.assign(form, getDefaultForm())
}

const handleSubmit = () => {
  if (
    !form.name.trim() ||
    !form.email.trim() ||
    !form.phone.trim() ||
    !form.course ||
    !form.batch ||
    !form.city ||
    !form.admissionDate
  ) {
    alert('Please fill all required fields.')
    return
  }

  addStudent({
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    course: form.course,
    batch: form.batch,
    gender: form.gender,
    city: form.city,
    admissionDate: form.admissionDate,
    status: form.status,
  })

  router.push('/students')
}
</script>

<style scoped>
.student-form-page {
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
.student-form {
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
  .form-actions > * {
    width: 100%;
  }
}
</style>
