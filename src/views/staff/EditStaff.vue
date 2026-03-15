<template>
  <div class="staff-form-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Staff</p>
        <h2>Edit Staff</h2>
      </div>

      <router-link to="/staff" class="app-btn app-btn-secondary app-btn-pill">
        Back to List
      </router-link>
    </div>

    <div v-if="!staffFound" class="not-found card">Staff record not found.</div>

    <div v-else class="form-card card">
      <form class="staff-form" @submit.prevent="submitForm">
        <div class="form-grid">
          <div class="form-group">
            <label>Staff Code</label>
            <input v-model.trim="form.staffCode" class="form-control" />
            <small v-if="errors.staffCode" class="error-text">{{ errors.staffCode }}</small>
          </div>

          <div class="form-group">
            <label>Full Name</label>
            <input v-model.trim="form.fullName" class="form-control" />
            <small v-if="errors.fullName" class="error-text">{{ errors.fullName }}</small>
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model.trim="form.email" type="email" class="form-control" />
            <small v-if="errors.email" class="error-text">{{ errors.email }}</small>
          </div>

          <div class="form-group">
            <label>Phone</label>
            <input v-model.trim="form.phone" class="form-control" />
            <small v-if="errors.phone" class="error-text">{{ errors.phone }}</small>
          </div>

          <div class="form-group">
            <label>Role</label>
            <select v-model="form.role" class="form-control">
              <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Department</label>
            <select v-model="form.department" class="form-control">
              <option value="">Select department</option>
              <option v-for="department in departments" :key="department" :value="department">
                {{ department }}
              </option>
            </select>
            <small v-if="errors.department" class="error-text">{{ errors.department }}</small>
          </div>

          <div class="form-group">
            <label>Qualification</label>
            <select v-model="form.qualification" class="form-control">
              <option value="">Select qualification</option>
              <option
                v-for="qualification in qualifications"
                :key="qualification"
                :value="qualification"
              >
                {{ qualification }}
              </option>
            </select>
            <small v-if="errors.qualification" class="error-text">{{ errors.qualification }}</small>
          </div>

          <div class="form-group">
            <label>Experience (Years)</label>
            <input
              v-model.number="form.experienceYears"
              type="number"
              min="0"
              class="form-control"
            />
            <small v-if="errors.experienceYears" class="error-text">{{
              errors.experienceYears
            }}</small>
          </div>

          <div class="form-group">
            <label>Gender</label>
            <select v-model="form.gender" class="form-control">
              <option v-for="gender in genders" :key="gender" :value="gender">{{ gender }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Joining Date</label>
            <input v-model="form.joiningDate" type="date" class="form-control" />
            <small v-if="errors.joiningDate" class="error-text">{{ errors.joiningDate }}</small>
          </div>

          <div class="form-group">
            <label>Salary</label>
            <input v-model.number="form.salary" type="number" min="0" class="form-control" />
            <small v-if="errors.salary" class="error-text">{{ errors.salary }}</small>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="form.status" class="form-control">
              <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label>Address</label>
            <input v-model.trim="form.address" class="form-control" />
            <small v-if="errors.address" class="error-text">{{ errors.address }}</small>
          </div>

          <div class="form-group">
            <label>City</label>
            <select v-model="form.city" class="form-control">
              <option value="">Select city</option>
              <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
            </select>
            <small v-if="errors.city" class="error-text">{{ errors.city }}</small>
          </div>

          <div class="form-group full-width">
            <label>Notes</label>
            <textarea v-model.trim="form.notes" class="form-control textarea-control"></textarea>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="app-btn app-btn-danger" @click="deleteStaff">Delete</button>
          <div class="spacer"></div>
          <router-link to="/staff" class="app-btn app-btn-secondary">Cancel</router-link>
          <button type="submit" class="app-btn app-btn-primary">Update Staff</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  cityOptions,
  departmentOptions,
  genderOptions,
  qualificationOptions,
  staffRoleOptions,
  statusOptions,
  useStaffStore,
} from '@/stores/staffStore'
import type { StaffUpdateInput } from '@/types/staff'

type FormErrors = Partial<Record<keyof StaffUpdateInput, string>>

const route = useRoute()
const router = useRouter()
const store = useStaffStore()

const staffId = Number(route.params.id)
const staffFound = ref(true)

const roles = [...staffRoleOptions]
const departments = [...departmentOptions]
const qualifications = [...qualificationOptions]
const genders = [...genderOptions]
const statuses = [...statusOptions]
const cities = [...cityOptions]

const form = reactive<Required<Omit<StaffUpdateInput, 'updatedAt'>>>({
  staffCode: '',
  fullName: '',
  email: '',
  phone: '',
  role: 'Teacher',
  department: '',
  qualification: '',
  experienceYears: 0,
  gender: 'Male',
  joiningDate: '',
  salary: 0,
  address: '',
  city: '',
  status: 'Active',
  notes: '',
})

const errors = reactive<FormErrors>({})

onMounted(() => {
  store.init()

  const current = store.getById(staffId)
  if (!current) {
    staffFound.value = false
    return
  }

  form.staffCode = current.staffCode
  form.fullName = current.fullName
  form.email = current.email
  form.phone = current.phone
  form.role = current.role
  form.department = current.department
  form.qualification = current.qualification
  form.experienceYears = current.experienceYears
  form.gender = current.gender
  form.joiningDate = current.joiningDate
  form.salary = current.salary
  form.address = current.address
  form.city = current.city
  form.status = current.status
  form.notes = current.notes
})

function clearErrors() {
  Object.keys(errors).forEach((key) => {
    delete errors[key as keyof FormErrors]
  })
}

function validate() {
  clearErrors()

  if (!form.staffCode.trim()) errors.staffCode = 'Staff code is required'
  if (!form.fullName.trim()) errors.fullName = 'Full name is required'
  if (!form.email.trim()) errors.email = 'Email is required'
  if (!form.phone.trim()) errors.phone = 'Phone is required'
  if (!form.department.trim()) errors.department = 'Department is required'
  if (!form.qualification.trim()) errors.qualification = 'Qualification is required'
  if (form.experienceYears < 0) errors.experienceYears = 'Experience cannot be negative'
  if (!form.joiningDate) errors.joiningDate = 'Joining date is required'
  if (form.salary < 0) errors.salary = 'Salary cannot be negative'
  if (!form.address.trim()) errors.address = 'Address is required'
  if (!form.city.trim()) errors.city = 'City is required'

  return Object.keys(errors).length === 0
}

function submitForm() {
  if (!validate()) return

  store.update(staffId, {
    ...form,
    staffCode: form.staffCode.trim(),
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    department: form.department.trim(),
    qualification: form.qualification.trim(),
    address: form.address.trim(),
    city: form.city.trim(),
    notes: form.notes.trim(),
  })

  router.push('/staff')
}

function deleteStaff() {
  const ok = window.confirm('Delete this staff record?')
  if (!ok) return
  store.remove(staffId)
  router.push('/staff')
}
</script>

<style scoped>
.staff-form-page {
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

.form-card,
.not-found {
  border-radius: 24px;
  padding: 24px;
}

.staff-form {
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

.full-width {
  grid-column: 1 / -1;
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
  padding: 0 14px;
  border-radius: 12px;
}

.textarea-control {
  min-height: 120px;
  padding: 14px;
  resize: vertical;
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
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 8px;
  align-items: center;
}

.spacer {
  flex: 1;
}

.not-found {
  font-weight: 700;
  color: #b91c1c;
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

  .form-card,
  .not-found {
    padding: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .form-actions > * {
    width: 100%;
  }

  .spacer {
    display: none;
  }
}
</style>
