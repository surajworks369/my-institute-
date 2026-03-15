<template>
  <div class="view-student-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Students</p>
        <h2>Student Details</h2>
      </div>

      <div class="head-actions">
        <router-link to="/students" class="app-btn app-btn-secondary app-btn-pill">
          Back to List
        </router-link>

        <button class="app-btn app-btn-primary app-btn-pill" @click="goEdit" :disabled="!student">
          Edit Student
        </button>
      </div>
    </div>

    <div v-if="!student" class="not-found card">Student not found.</div>

    <div v-else class="details-layout">
      <div class="profile-card card">
        <div class="profile-top">
          <div class="avatar">{{ initials }}</div>
          <div class="profile-badge">Student Profile</div>
        </div>

        <h3>{{ student.name }}</h3>
        <p>{{ student.email }}</p>

        <span
          class="status-pill"
          :class="student.status === 'Active' ? 'status-active' : 'status-inactive'"
        >
          {{ student.status }}
        </span>
      </div>

      <div class="details-card card">
        <h3>Basic Information</h3>

        <div class="details-grid">
          <div class="info-box">
            <label>ID</label>
            <p>#{{ student.id }}</p>
          </div>

          <div class="info-box">
            <label>Phone</label>
            <p>{{ student.phone }}</p>
          </div>

          <div class="info-box">
            <label>Course</label>
            <p>{{ student.course }}</p>
          </div>

          <div class="info-box">
            <label>Batch</label>
            <p>{{ student.batch }}</p>
          </div>

          <div class="info-box">
            <label>Gender</label>
            <p>{{ student.gender }}</p>
          </div>

          <div class="info-box">
            <label>City</label>
            <p>{{ student.city }}</p>
          </div>

          <div class="info-box">
            <label>Admission Date</label>
            <p>{{ formatDate(student.admissionDate) }}</p>
          </div>

          <div class="info-box">
            <label>Status</label>
            <p>{{ student.status }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onActivated, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/studentsStore'

const route = useRoute()
const router = useRouter()
const studentStore = useStudentStore()
const { getStudentById, init } = studentStore

init()

const id = Number(route.params.id)
const student = computed(() => getStudentById(id))

const scrollPageToTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0

  const selectors = [
    '.main-content',
    '.content-area',
    '.page-content',
    '.layout-content',
    '.main-layout-content',
    '.router-view-container',
  ]

  selectors.forEach((selector) => {
    const element = document.querySelector(selector)
    if (element instanceof HTMLElement) {
      element.scrollTop = 0
      element.scrollLeft = 0
    }
  })
}

const forceScrollTop = async () => {
  await nextTick()
  scrollPageToTop()

  requestAnimationFrame(() => {
    scrollPageToTop()
    setTimeout(() => {
      scrollPageToTop()
    }, 60)
  })
}

onMounted(async () => {
  await forceScrollTop()
})

onActivated(async () => {
  await forceScrollTop()
})

const initials = computed(() => {
  if (!student.value?.name) return '--'
  return student.value.name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
})

const goEdit = () => {
  if (!student.value) return
  router.push(`/students/edit/${student.value.id}`)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB')
}
</script>

<style scoped>
.view-student-page {
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
