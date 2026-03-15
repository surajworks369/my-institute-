<template>
  <div class="view-batch-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Batches</p>
        <h2>Batch Details</h2>
      </div>

      <div class="head-actions">
        <router-link to="/batches" class="app-btn app-btn-secondary app-btn-pill">
          Back to List
        </router-link>

        <button class="app-btn app-btn-primary app-btn-pill" @click="goEdit" :disabled="!batch">
          Edit Batch
        </button>
      </div>
    </div>

    <div v-if="!batch" class="not-found card">Batch not found.</div>

    <div v-else class="details-layout">
      <div class="profile-card card">
        <div class="profile-top">
          <div class="avatar">🗂️</div>
          <div class="profile-badge">Batch Profile</div>
        </div>

        <h3>{{ batch.name }}</h3>
        <p>{{ batch.code }} • {{ courseName }}</p>

        <span
          class="status-pill"
          :class="batch.status === 'Active' ? 'status-active' : 'status-inactive'"
        >
          {{ batch.status }}
        </span>

        <div class="profile-actions">
          <button
            v-if="batch.status === 'Active'"
            class="app-btn app-btn-secondary profile-action-btn"
            @click="setInactive"
          >
            Mark Inactive
          </button>

          <button v-else class="app-btn app-btn-primary profile-action-btn" @click="setActive">
            Mark Active
          </button>
        </div>
      </div>

      <div class="details-stack">
        <div class="details-card card">
          <h3>Overview</h3>

          <div class="details-grid">
            <div class="info-box">
              <label>Course</label>
              <p>{{ courseName }}</p>
            </div>

            <div class="info-box">
              <label>Classroom</label>
              <p>{{ batch.classroom || '-' }}</p>
            </div>

            <div class="info-box">
              <label>Start Date</label>
              <p>{{ formatDate(batch.startDate) }}</p>
            </div>

            <div class="info-box">
              <label>End Date</label>
              <p>{{ formatDate(batch.endDate) }}</p>
            </div>

            <div class="info-box">
              <label>Timing</label>
              <p>{{ batch.timing }}</p>
            </div>

            <div class="info-box">
              <label>Days</label>
              <p>{{ batch.days.join(', ') }}</p>
            </div>
          </div>
        </div>

        <div class="details-card card">
          <h3>Faculty Mapping</h3>

          <div class="details-grid">
            <div class="info-box">
              <label>Trainer</label>
              <p>{{ batch.trainer }}</p>
            </div>

            <div class="info-box">
              <label>Assistant Trainer</label>
              <p>{{ batch.assistantTrainer || '-' }}</p>
            </div>
          </div>
        </div>

        <div class="details-card card">
          <h3>Capacity & Occupancy</h3>

          <div class="capacity-grid">
            <div class="capacity-box">
              <label>Enrolled</label>
              <div class="capacity-value">{{ batch.enrolled }}</div>
            </div>

            <div class="capacity-box">
              <label>Capacity</label>
              <div class="capacity-value">{{ batch.capacity }}</div>
            </div>
          </div>

          <div class="occupancy-section">
            <div class="occupancy-top">
              <span>Occupancy</span>
              <span>{{ occupancyPercent }}%</span>
            </div>

            <div class="occupancy-bar">
              <div class="occupancy-fill" :style="{ width: `${occupancyPercent}%` }"></div>
            </div>
          </div>
        </div>

        <div class="details-card card">
          <h3>Additional Notes</h3>

          <div class="description-box">
            {{ batch.notes || 'No notes available.' }}
          </div>
        </div>

        <div class="details-card card">
          <h3>Record Info</h3>

          <div class="details-grid">
            <div class="info-box">
              <label>Created</label>
              <p>{{ formatDateTime(batch.createdAt) }}</p>
            </div>

            <div class="info-box">
              <label>Updated</label>
              <p>{{ formatDateTime(batch.updatedAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBatchesStore } from '@/stores/batchesStore'
import { useCourseStore } from '@/stores/courseStore'

const route = useRoute()
const router = useRouter()
const batchStore = useBatchesStore()
const courseStore = useCourseStore()

const id = Number(route.params.id)
const batch = ref(batchStore.getById(id))

onMounted(() => {
  courseStore.init()
  batchStore.init()
  batch.value = batchStore.getById(id)
})

const courseName = computed(() => {
  if (!batch.value) return 'Unknown'
  const course = courseStore.getCourseById(batch.value.courseId)
  return course?.name ?? 'Unknown'
})

const occupancyPercent = computed(() => {
  if (!batch.value) return 0
  const capacity = batch.value.capacity
  if (capacity <= 0) return 0
  const value = Math.round((batch.value.enrolled / capacity) * 100)
  return Math.max(0, Math.min(100, value))
})

const formatDate = (value: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-GB')
}

const formatDateTime = (value: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-GB')
}

const goEdit = () => {
  if (!batch.value) return
  router.push(`/batches/edit/${id}`)
}

const setActive = () => {
  batchStore.setStatus(id, 'Active')
  batch.value = batchStore.getById(id)
}

const setInactive = () => {
  batchStore.setStatus(id, 'Inactive')
  batch.value = batchStore.getById(id)
}
</script>

<style scoped>
.view-batch-page {
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

.not-found {
  font-weight: 700;
  color: #b91c1c;
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

.profile-actions {
  margin-top: 16px;
  width: 100%;
}

.profile-action-btn {
  width: 100%;
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

.capacity-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.capacity-box {
  padding: 18px;
  border-radius: 18px;
  text-align: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.capacity-box label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  color: #64748b;
  margin-bottom: 10px;
}

.capacity-value {
  font-size: 30px;
  font-weight: 800;
  color: #111827;
}

.occupancy-section {
  margin-top: 8px;
}

.occupancy-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.occupancy-bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.2);
  overflow: hidden;
}

.occupancy-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(135deg, #2563eb, #4f46e5);
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

  .details-grid,
  .capacity-grid {
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
