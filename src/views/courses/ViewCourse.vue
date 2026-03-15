<template>
  <div class="view-course-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Courses</p>
        <h2>Course Details</h2>
      </div>

      <div class="head-actions">
        <router-link to="/courses" class="app-btn app-btn-secondary app-btn-pill">
          Back to List
        </router-link>

        <button class="app-btn app-btn-primary app-btn-pill" @click="goEdit" :disabled="!course">
          Edit Course
        </button>
      </div>
    </div>

    <div v-if="!course" class="not-found card">Course not found.</div>

    <div v-else class="details-layout">
      <div class="profile-card card">
        <div class="profile-top">
          <div class="avatar">📘</div>
          <div class="profile-badge">Course Profile</div>
        </div>

        <h3>{{ course.name }}</h3>
        <p>{{ course.code }}</p>

        <span
          class="status-pill"
          :class="course.status === 'Active' ? 'status-active' : 'status-inactive'"
        >
          {{ course.status }}
        </span>
      </div>

      <div class="details-stack">
        <div class="details-card card">
          <h3>Basic Information</h3>

          <div class="details-grid">
            <div class="info-box">
              <label>ID</label>
              <p>#{{ course.id }}</p>
            </div>

            <div class="info-box">
              <label>Duration</label>
              <p>{{ course.duration }}</p>
            </div>

            <div class="info-box">
              <label>Fees</label>
              <p>{{ formatCurrency(course.fees) }}</p>
            </div>

            <div class="info-box">
              <label>Status</label>
              <p>{{ course.status }}</p>
            </div>
          </div>
        </div>

        <div class="details-card card">
          <h3>Schedule & Capacity</h3>

          <div class="details-grid">
            <div class="info-box">
              <label>Start Date</label>
              <p>{{ formatDate(course.startDate) }}</p>
            </div>

            <div class="info-box">
              <label>End Date</label>
              <p>{{ formatDate(course.endDate) }}</p>
            </div>

            <div class="info-box">
              <label>Batch Label</label>
              <p>{{ course.batch }}</p>
            </div>

            <div class="info-box">
              <label>Students</label>
              <p>{{ course.enrolledStudents }}/{{ course.maxStudents }}</p>
            </div>
          </div>
        </div>

        <div class="details-card card">
          <h3>Faculty Mapping</h3>

          <div class="details-grid">
            <div class="info-box">
              <label>Trainer</label>
              <p>{{ course.trainer || '-' }}</p>
            </div>

            <div class="info-box">
              <label>Assistant Trainer</label>
              <p>{{ course.assistantTrainer || '-' }}</p>
            </div>
          </div>
        </div>

        <div class="details-card card">
          <h3>Description</h3>

          <div class="description-box">
            {{ course.description || 'No description available.' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCourseStore } from '@/stores/courseStore'

const route = useRoute()
const router = useRouter()
const courseStore = useCourseStore()
const { getCourseById, init } = courseStore

const id = Number(route.params.id)

onMounted(() => {
  init()
})

const course = computed(() => getCourseById(id))

const goEdit = () => {
  if (!course.value) return
  router.push(`/courses/edit/${course.value.id}`)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<style scoped>
.view-course-page {
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

.description-box {
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: #334155;
  line-height: 1.7;
  font-size: 15px;
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
