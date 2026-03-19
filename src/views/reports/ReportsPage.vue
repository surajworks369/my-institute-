<template>
  <div class="reports-dashboard-page fade-in">
    <div class="page-head">
      <div>
        <p class="eyebrow">Reports & Analytics</p>
        <h2>Reports Dashboard</h2>
        <p class="sub">Smart overview of Students, Attendance, Exams and Fees across the ERP.</p>
      </div>
    </div>

    <section class="stats-grid">
      <div class="stat-card stat-card-students">
        <div class="stat-icon">👨‍🎓</div>
        <div class="stat-content">
          <p>Total Students</p>
          <h3>{{ summary.totalStudents }}</h3>
          <small
            >Active {{ summary.activeStudents }} / Inactive {{ summary.inactiveStudents }}</small
          >
        </div>
      </div>

      <div class="stat-card stat-card-attendance">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <p>Attendance Records</p>
          <h3>{{ summary.totalAttendance }}</h3>
          <small>Present {{ summary.presentCount }} / Absent {{ summary.absentCount }}</small>
        </div>
      </div>

      <div class="stat-card stat-card-exams">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <p>Exam Performance</p>
          <h3>{{ summary.passCount }} / {{ summary.failCount }}</h3>
          <small>Avg Marks {{ summary.avgMarks }}</small>
        </div>
      </div>

      <div class="stat-card stat-card-fees">
        <div class="stat-icon">💳</div>
        <div class="stat-content">
          <p>Fees Overview</p>
          <h3>{{ formatCurrencyShort(summary.totalCollected) }}</h3>
          <small>Pending {{ formatCurrencyShort(summary.totalPending) }}</small>
        </div>
      </div>
    </section>

    <section class="highlights-grid">
      <div class="highlight-card card">
        <div class="highlight-top">
          <span class="highlight-badge">Quick Insight</span>
          <h3>Attendance Snapshot</h3>
        </div>
        <div class="highlight-metrics">
          <div class="metric-box">
            <span>Late</span>
            <strong>{{ summary.lateCount }}</strong>
          </div>
          <div class="metric-box">
            <span>Leave</span>
            <strong>{{ summary.leaveCount }}</strong>
          </div>
        </div>
      </div>

      <div class="highlight-card card">
        <div class="highlight-top">
          <span class="highlight-badge">Finance Alert</span>
          <h3>Fee Status Breakdown</h3>
        </div>
        <div class="highlight-metrics">
          <div class="metric-box">
            <span>Paid</span>
            <strong>{{ summary.paidFeeCount }}</strong>
          </div>
          <div class="metric-box">
            <span>Overdue</span>
            <strong>{{ summary.overdueFeeCount }}</strong>
          </div>
        </div>
      </div>

      <div class="highlight-card card">
        <div class="highlight-top">
          <span class="highlight-badge">Academic Insight</span>
          <h3>Exam Health</h3>
        </div>
        <div class="highlight-metrics">
          <div class="metric-box">
            <span>Pass</span>
            <strong>{{ summary.passCount }}</strong>
          </div>
          <div class="metric-box">
            <span>Fail</span>
            <strong>{{ summary.failCount }}</strong>
          </div>
        </div>
      </div>

      <div class="highlight-card card">
        <div class="highlight-top">
          <span class="highlight-badge">Student Pulse</span>
          <h3>Student Status</h3>
        </div>
        <div class="highlight-metrics">
          <div class="metric-box">
            <span>Active</span>
            <strong>{{ summary.activeStudents }}</strong>
          </div>
          <div class="metric-box">
            <span>Inactive</span>
            <strong>{{ summary.inactiveStudents }}</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="reports-grid">
      <div class="report-card report-card-students card">
        <div class="report-card-head">
          <span class="report-icon">👨‍🎓</span>
          <span class="report-chip">Student Analytics</span>
        </div>
        <h3>Student Report</h3>
        <p>Analyze students by course, batch, city, status and admission trends.</p>
        <button class="report-btn" @click="goStudents">Open Report</button>
      </div>

      <div class="report-card report-card-attendance card">
        <div class="report-card-head">
          <span class="report-icon">📋</span>
          <span class="report-chip">Attendance Analytics</span>
        </div>
        <h3>Attendance Report</h3>
        <p>Track attendance records, marked by entries, dates and status distribution.</p>
        <button class="report-btn" @click="goAttendance">Open Report</button>
      </div>

      <div class="report-card report-card-exams card">
        <div class="report-card-head">
          <span class="report-icon">📝</span>
          <span class="report-chip">Performance Analytics</span>
        </div>
        <h3>Exam Report</h3>
        <p>Review marks, pass/fail ratios, exam-wise performance and academic outcomes.</p>
        <button class="report-btn" @click="goExams">Open Report</button>
      </div>

      <div class="report-card report-card-fees card">
        <div class="report-card-head">
          <span class="report-icon">💰</span>
          <span class="report-chip">Finance Analytics</span>
        </div>
        <h3>Fees Report</h3>
        <p>Track collections, pending amounts, overdue fee records and payment modes.</p>
        <button class="report-btn" @click="goFees">Open Report</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReportStore } from '@/stores/reportStore'

const router = useRouter()
const reportStore = useReportStore()

onMounted(() => {
  reportStore.init()
})

const summary = computed(() => reportStore.summary)

function goStudents() {
  router.push('/reports/students')
}

function goAttendance() {
  router.push('/reports/attendance')
}

function goExams() {
  router.push('/reports/exams')
}

function goFees() {
  router.push('/reports/fees')
}

function formatCurrencyShort(value: number) {
  const amount = Number(value || 0)
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}
</script>

<style scoped>
.reports-dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
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

.sub {
  margin-top: 8px;
  color: #64748b;
  font-size: 14px;
}

.stats-grid,
.highlights-grid,
.reports-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 20px;
  min-height: 140px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: white;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.14);
}

.stat-card::after {
  content: '';
  position: absolute;
  inset: auto -30px -30px auto;
  width: 120px;
  height: 120px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
}

.stat-card-students {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
}

.stat-card-attendance {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
}

.stat-card-exams {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
}

.stat-card-fees {
  background: linear-gradient(135deg, #b45309, #f59e0b);
}

.stat-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-content p {
  font-size: 14px;
  opacity: 0.92;
  margin-bottom: 6px;
}

.stat-content h3 {
  font-size: 30px;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-content small {
  opacity: 0.86;
  font-size: 12px;
}

.highlight-card,
.report-card {
  border-radius: 22px;
  padding: 18px;
}

.highlight-top {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.highlight-badge,
.report-chip {
  display: inline-flex;
  width: fit-content;
  min-height: 30px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.highlight-badge {
  background: rgba(79, 70, 229, 0.12);
  color: #4338ca;
}

.highlight-card h3 {
  font-size: 18px;
  font-weight: 800;
}

.highlight-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.metric-box {
  padding: 14px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.metric-box span {
  display: block;
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
  margin-bottom: 8px;
}

.metric-box strong {
  font-size: 18px;
  color: #0f172a;
}

.report-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.report-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 14px;
}

.report-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
}

.report-card-students .report-chip {
  background: rgba(79, 70, 229, 0.12);
  color: #4338ca;
}

.report-card-attendance .report-chip {
  background: rgba(20, 184, 166, 0.12);
  color: #0f766e;
}

.report-card-exams .report-chip {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.report-card-fees .report-chip {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}

.report-card h3 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 8px;
  color: #0f172a;
}

.report-card p {
  font-size: 13px;
  line-height: 1.55;
  color: #64748b;
  margin-bottom: 16px;
}

.report-btn {
  min-height: 42px;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 800;
  color: white;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.report-btn:hover {
  transform: translateY(-1px);
}

.report-card-students .report-btn {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  box-shadow: 0 14px 28px rgba(79, 70, 229, 0.18);
}

.report-card-attendance .report-btn {
  background: linear-gradient(135deg, #0f766e, #14b8a6);
  box-shadow: 0 14px 28px rgba(20, 184, 166, 0.18);
}

.report-card-exams .report-btn {
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.18);
}

.report-card-fees .report-btn {
  background: linear-gradient(135deg, #b45309, #f59e0b);
  box-shadow: 0 14px 28px rgba(245, 158, 11, 0.18);
}

@media (max-width: 1200px) {
  .stats-grid,
  .highlights-grid,
  .reports-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-head h2 {
    font-size: 24px;
  }

  .stats-grid,
  .highlights-grid,
  .reports-grid,
  .highlight-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
