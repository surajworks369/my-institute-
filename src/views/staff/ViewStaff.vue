<template>
  <div class="view-staff-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Staff</p>
        <h2>Staff Details</h2>
      </div>

      <div class="head-actions">
        <router-link to="/staff" class="app-btn app-btn-secondary app-btn-pill">
          Back to List
        </router-link>

        <button class="app-btn app-btn-primary app-btn-pill" @click="goEdit" :disabled="!staff">
          Edit Staff
        </button>
      </div>
    </div>

    <div v-if="!staff" class="not-found card">Staff not found.</div>

    <div v-else class="details-layout">
      <div class="profile-card card">
        <div class="profile-top">
          <div class="avatar">{{ initials }}</div>
          <div class="profile-badge">Staff Profile</div>
        </div>

        <h3>{{ staff.fullName }}</h3>
        <p>{{ staff.email }}</p>

        <span class="status-pill" :class="statusClass(staff.status)">
          {{ staff.status }}
        </span>

        <div class="summary-list">
          <div class="summary-row">
            <span>Staff Code</span>
            <strong>{{ staff.staffCode }}</strong>
          </div>
          <div class="summary-row">
            <span>Role</span>
            <strong>{{ staff.role }}</strong>
          </div>
          <div class="summary-row">
            <span>Department</span>
            <strong>{{ staff.department }}</strong>
          </div>
          <div class="summary-row">
            <span>Salary</span>
            <strong>{{ formatCurrency(staff.salary) }}</strong>
          </div>
        </div>
      </div>

      <div class="details-card card">
        <h3>Personal Information</h3>

        <div class="details-grid">
          <div class="info-box">
            <label>Full Name</label>
            <p>{{ staff.fullName }}</p>
          </div>

          <div class="info-box">
            <label>Gender</label>
            <p>{{ staff.gender }}</p>
          </div>

          <div class="info-box">
            <label>Email</label>
            <p>{{ staff.email }}</p>
          </div>

          <div class="info-box">
            <label>Phone</label>
            <p>{{ staff.phone }}</p>
          </div>

          <div class="info-box">
            <label>City</label>
            <p>{{ staff.city }}</p>
          </div>

          <div class="info-box">
            <label>Address</label>
            <p>{{ staff.address }}</p>
          </div>
        </div>
      </div>

      <div class="details-card card">
        <h3>Employment Information</h3>

        <div class="details-grid">
          <div class="info-box">
            <label>Role</label>
            <p>{{ staff.role }}</p>
          </div>

          <div class="info-box">
            <label>Department</label>
            <p>{{ staff.department }}</p>
          </div>

          <div class="info-box">
            <label>Qualification</label>
            <p>{{ staff.qualification }}</p>
          </div>

          <div class="info-box">
            <label>Experience</label>
            <p>{{ staff.experienceYears }} Years</p>
          </div>

          <div class="info-box">
            <label>Joining Date</label>
            <p>{{ formatDate(staff.joiningDate) }}</p>
          </div>

          <div class="info-box">
            <label>Salary</label>
            <p>{{ formatCurrency(staff.salary) }}</p>
          </div>

          <div class="info-box">
            <label>Created At</label>
            <p>{{ formatDateTime(staff.createdAt) }}</p>
          </div>

          <div class="info-box">
            <label>Updated At</label>
            <p>{{ formatDateTime(staff.updatedAt) }}</p>
          </div>
        </div>
      </div>

      <div class="details-card card full-span">
        <h3>Notes</h3>
        <div class="note-box">
          {{ staff.notes || 'No notes available.' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStaffStore } from '@/stores/staffStore'
import type { StaffStatus } from '@/types/staff'

const route = useRoute()
const router = useRouter()
const store = useStaffStore()

const staffId = Number(route.params.id)

onMounted(() => {
  store.init()
})

const staff = computed(() => store.getById(staffId))

const initials = computed(() => {
  if (!staff.value?.fullName) return '--'
  return staff.value.fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
})

function goEdit() {
  if (!staff.value) return
  router.push(`/staff/edit/${staffId}`)
}

function statusClass(status: StaffStatus): string {
  if (status === 'Active') return 'status-active'
  if (status === 'Inactive') return 'status-inactive'
  return 'status-leave'
}

function formatDate(value: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB')
}

function formatDateTime(value: string) {
  if (!value) return '—'
  return value.replace('T', ' ').slice(0, 16)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}
</script>

<style scoped>
.view-staff-page {
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
  grid-row: span 2;
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
  font-size: 28px;
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

.summary-list {
  width: 100%;
  margin-top: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.summary-row span {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.summary-row strong {
  color: #0f172a;
  font-size: 14px;
  text-align: right;
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
  word-break: break-word;
}

.full-span {
  grid-column: 1 / -1;
}

.note-box {
  min-height: 110px;
  border-radius: 18px;
  padding: 16px;
  background: rgba(248, 250, 252, 0.98);
  border: 1px solid rgba(148, 163, 184, 0.14);
  line-height: 1.7;
  color: #334155;
  font-weight: 500;
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

.status-active {
  color: #065f46;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.18);
}

.status-inactive {
  color: #991b1b;
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.18);
}

.status-leave {
  color: #92400e;
  background: rgba(245, 158, 11, 0.14);
  border: 1px solid rgba(245, 158, 11, 0.18);
}

.not-found {
  font-weight: 700;
  color: #b91c1c;
}

@media (max-width: 1100px) {
  .details-layout {
    grid-template-columns: 1fr;
  }

  .profile-card {
    grid-row: auto;
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
