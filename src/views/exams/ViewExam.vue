<template>
  <div class="view-exam-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Exams</p>
        <h2>Exam Details</h2>
      </div>

      <div class="head-actions">
        <router-link to="/exams" class="app-btn app-btn-secondary app-btn-pill">
          Back to List
        </router-link>

        <button class="app-btn app-btn-primary app-btn-pill" @click="goEdit" :disabled="!exam">
          Edit Exam
        </button>
      </div>
    </div>

    <div v-if="!exam" class="not-found card">Exam not found.</div>

    <div v-else class="details-layout">
      <div class="profile-card card">
        <div class="profile-top">
          <div class="avatar">📝</div>
          <div class="profile-badge">Exam Profile</div>
        </div>

        <h3>{{ exam.name }}</h3>
        <p>{{ exam.code }}</p>

        <span class="status-pill" :class="getStatusClass(exam.status)">
          {{ exam.status }}
        </span>
      </div>

      <div class="details-stack">
        <div class="details-card card">
          <h3>Exam Information</h3>

          <div class="details-grid">
            <div class="info-box">
              <label>ID</label>
              <p>#{{ exam.id }}</p>
            </div>

            <div class="info-box">
              <label>Type</label>
              <p>{{ exam.type }}</p>
            </div>

            <div class="info-box">
              <label>Date</label>
              <p>{{ formatDate(exam.examDate) }}</p>
            </div>

            <div class="info-box">
              <label>Time</label>
              <p>{{ exam.startTime }} - {{ exam.endTime }}</p>
            </div>
          </div>
        </div>

        <div class="details-card card">
          <h3>Academic Mapping</h3>

          <div class="details-grid">
            <div class="info-box">
              <label>Course</label>
              <p>{{ courseName }}</p>
            </div>

            <div class="info-box">
              <label>Batch</label>
              <p>{{ batchName }}</p>
            </div>

            <div class="info-box">
              <label>Total Marks</label>
              <p>{{ exam.totalMarks }}</p>
            </div>

            <div class="info-box">
              <label>Passing Marks</label>
              <p>{{ exam.passingMarks }}</p>
            </div>
          </div>
        </div>

        <div class="details-card card">
          <div class="section-row">
            <div>
              <h3>Marks Summary</h3>
              <p class="section-sub">Current marks entries linked to this exam</p>
            </div>

            <router-link :to="`/exams/marks/add?examId=${exam.id}`" class="app-btn app-btn-primary">
              + Add Mark Entry
            </router-link>
          </div>

          <div class="summary-grid">
            <div class="summary-box">
              <label>Total Entries</label>
              <p>{{ marksForExam.length }}</p>
            </div>

            <div class="summary-box">
              <label>Pass</label>
              <p>{{ passCount }}</p>
            </div>

            <div class="summary-box">
              <label>Fail</label>
              <p>{{ failCount }}</p>
            </div>

            <div class="summary-box">
              <label>Avg Marks</label>
              <p>{{ averageMarks }}</p>
            </div>
          </div>
        </div>

        <div class="details-card card">
          <div class="section-row">
            <div>
              <h3>Mark Entries</h3>
              <p class="section-sub">Showing linked marks entries for this exam</p>
            </div>

            <div class="search-box">
              <input
                v-model.trim="globalSearch"
                type="text"
                placeholder="Search by student, status, checker..."
              />
            </div>
          </div>

          <div class="marks-table-wrapper">
            <table class="marks-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student</th>
                  <th>Obtained</th>
                  <th>Status</th>
                  <th>Checked By</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                <tr v-if="filteredMarks.length === 0">
                  <td colspan="6" class="empty-state">No marks entries found.</td>
                </tr>

                <tr v-for="mark in filteredMarks" :key="mark.id">
                  <td>#{{ mark.id }}</td>
                  <td>{{ studentName(mark.studentId) }}</td>
                  <td>{{ mark.obtainedMarks }}/{{ exam.totalMarks }}</td>

                  <td>
                    <span
                      class="result-pill"
                      :class="mark.status === 'Pass' ? 'result-pass' : 'result-fail'"
                    >
                      {{ mark.status }}
                    </span>
                  </td>

                  <td>{{ mark.checkedBy }}</td>

                  <td>
                    <router-link :to="`/exams/marks/edit/${mark.id}`" class="table-link">
                      Edit
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="details-card card">
          <h3>Instructions</h3>
          <div class="description-box">
            {{ exam.instructions || 'No instructions available.' }}
          </div>
        </div>

        <div class="details-card card danger-card">
          <h3>Danger Zone</h3>
          <div class="danger-box">
            <p>Deleting this exam will also remove all related marks entries.</p>
            <button class="app-btn app-btn-danger" @click="deleteExam">Delete Exam</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExamStore } from '@/stores/examStore'
import { useBatchesStore } from '@/stores/batchesStore'
import { useCourseStore } from '@/stores/courseStore'
import { useStudentStore } from '@/stores/studentsStore'
import type { ExamStatus } from '@/types/exam'

const route = useRoute()
const router = useRouter()

const examStore = useExamStore()
const batchStore = useBatchesStore()
const courseStore = useCourseStore()
const studentStore = useStudentStore()

const id = Number(route.params.id)
const globalSearch = ref('')

onMounted(() => {
  batchStore.init()
  courseStore.init()
  studentStore.init()
  examStore.init()
})

const exam = computed(() => examStore.getExamById(id))
const marksForExam = computed(() => examStore.marksByExam(id))

const courseName = computed(() => {
  if (!exam.value) return '—'
  return courseStore.getCourseById(exam.value.courseId)?.name ?? `Course ${exam.value.courseId}`
})

const batchName = computed(() => {
  if (!exam.value) return '—'
  return batchStore.getById(exam.value.batchId)?.name ?? `Batch ${exam.value.batchId}`
})

const passCount = computed(() => marksForExam.value.filter((mark) => mark.status === 'Pass').length)
const failCount = computed(() => marksForExam.value.filter((mark) => mark.status === 'Fail').length)

const averageMarks = computed(() => {
  if (!marksForExam.value.length) return '0'
  const total = marksForExam.value.reduce((sum, mark) => sum + mark.obtainedMarks, 0)
  return (total / marksForExam.value.length).toFixed(1)
})

const filteredMarks = computed(() => {
  const query = globalSearch.value.trim().toLowerCase()
  if (!query) return marksForExam.value

  return marksForExam.value.filter((mark) => {
    const name = studentName(mark.studentId).toLowerCase()
    return (
      name.includes(query) ||
      mark.status.toLowerCase().includes(query) ||
      mark.checkedBy.toLowerCase().includes(query) ||
      String(mark.id).includes(query)
    )
  })
})

function studentName(id: number) {
  return studentStore.getStudentById(id)?.name ?? `Student ${id}`
}

function getStatusClass(status: ExamStatus) {
  if (status === 'Upcoming') return 'status-upcoming'
  if (status === 'Ongoing') return 'status-ongoing'
  if (status === 'Completed') return 'status-completed'
  return 'status-cancelled'
}

function formatDate(date: string) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-GB')
}

function goEdit() {
  if (!exam.value) return
  router.push(`/exams/edit/${exam.value.id}`)
}

function deleteExam() {
  if (!exam.value) return
  const confirmed = window.confirm('Delete this exam? Related marks entries will also be removed.')
  if (!confirmed) return
  examStore.removeExam(exam.value.id)
  router.push('/exams')
}
</script>

<style scoped>
.view-exam-page {
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

.status-upcoming {
  color: #1d4ed8;
  background: rgba(59, 130, 246, 0.14);
  border: 1px solid rgba(59, 130, 246, 0.18);
}
.status-ongoing {
  color: #9a3412;
  background: rgba(249, 115, 22, 0.14);
  border: 1px solid rgba(249, 115, 22, 0.18);
}
.status-completed {
  color: #065f46;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.18);
}
.status-cancelled {
  color: #991b1b;
  background: rgba(239, 68, 68, 0.14);
  border: 1px solid rgba(239, 68, 68, 0.18);
}

.details-card h3 {
  font-size: 22px;
  margin-bottom: 18px;
}

.details-grid,
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.info-box,
.summary-box {
  padding: 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.04);
}

.info-box label,
.summary-box label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  color: #64748b;
  margin-bottom: 8px;
}

.info-box p,
.summary-box p {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.section-row {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.section-sub {
  color: #64748b;
  font-size: 13px;
}

.search-box {
  width: 320px;
  max-width: 100%;
}

.search-box input {
  width: 100%;
  min-height: 44px;
  border-radius: 12px;
  border: 1.5px solid #cbd5e1;
  padding: 0 14px;
  background: #fff;
}

.marks-table-wrapper {
  width: 100%;
  overflow: auto;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.marks-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

.marks-table th {
  background: linear-gradient(180deg, #eff4ff, #e9eefc);
  color: #1e293b;
  font-size: 13px;
  font-weight: 800;
  padding: 12px 10px;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.marks-table td {
  padding: 10px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #334155;
  font-size: 14px;
}

.result-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 70px;
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

.table-link {
  border: none;
  background: none;
  color: var(--primary);
  font-weight: 700;
  cursor: pointer;
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

.danger-card {
  border-color: rgba(239, 68, 68, 0.18);
}

.danger-box {
  padding: 16px;
  border-radius: 18px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.16);
  color: #7f1d1d;
}

.danger-box p {
  margin-bottom: 12px;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 28px 16px !important;
  color: #64748b;
  font-weight: 600;
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

  .details-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .head-actions {
    width: 100%;
  }

  .head-actions > * {
    width: 100%;
  }

  .section-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-box {
    width: 100%;
  }
}
</style>
