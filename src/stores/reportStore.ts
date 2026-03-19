/**
 * `stores/reportStore.ts` (Reports Store / Pinia - computed reports)
 *
 * - **कशासाठी**: Students/Attendance/Exams/Fees यांचे report rows आणि filtering logic तयार करणे.
 * - **Project मधली role**: Reports pages ला unified report data, filters आणि summary metrics provide करते.
 * - **Logic प्रकार**:
 *   - विविध stores मधून data join करून report rows बनवणे
 *   - search/date/status/paymentMethod based filtering
 *   - report summary (counts + totals) compute करणे
 * - **File प्रकार**: store (frontend / Pinia)
 *
 * Note: सध्या reports पूर्ण frontend computed आहेत. पुढे backend/API आल्यावर heavy reports
 * server-side तयार होऊन pagination/export endpoints मधून येऊ शकतात.
 */

import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useStudentStore } from '@/stores/studentsStore'
import { useCourseStore } from '@/stores/courseStore'
import { useBatchesStore } from '@/stores/batchesStore'
import { useAttendanceStore } from '@/stores/attendanceStore'
import { useExamStore } from '@/stores/examStore'
import { useFeesStore } from '@/stores/feesStore'
import type {
  AttendanceReportRow,
  ExamReportRow,
  FeesReportRow,
  PaymentMethod,
  ReportFilters,
  ReportSummary,
  StudentReportRow,
} from '@/types/report'

// Date filter helper: from/to range मध्ये आहे का?
function inDateRange(date: string, fromDate?: string, toDate?: string): boolean {
  if (fromDate && date < fromDate) return false
  if (toDate && date > toDate) return false
  return true
}

// Search helper: अनेक fields मध्ये query match शोधतो
function matchesSearch(values: Array<string | number | undefined>, query?: string): boolean {
  if (!query || !query.trim()) return true
  const q = query.trim().toLowerCase()
  return values.some((v) =>
    String(v ?? '')
      .toLowerCase()
      .includes(q),
  )
}

export const useReportStore = defineStore('reports', () => {
  // Dependent stores: report rows तयार करण्यासाठी source data
  const studentStore = useStudentStore()
  const courseStore = useCourseStore()
  const batchStore = useBatchesStore()
  const attendanceStore = useAttendanceStore()
  const examStore = useExamStore()
  const feesStore = useFeesStore()

  // Init: सर्व dependent stores init (localStorage/demo seed load)
  function init() {
    studentStore.init()
    courseStore.init()
    batchStore.init()
    attendanceStore.init()
    examStore.init()
    feesStore.init()
  }

  // Base report rows (unfiltered) – UI filters नंतर apply होतात
  const studentReports = computed<StudentReportRow[]>(() => {
    return studentStore.students.map((student) => {
      const course = courseStore.getCourseByName(student.course)
      const batch =
        batchStore.batches.find(
          (entry) => entry.name === student.batch && (!course || entry.courseId === course.id),
        ) ?? batchStore.batches.find((entry) => entry.name === student.batch)

      return {
        id: student.id,
        studentId: student.id,
        studentName: student.name,
        courseId: course?.id ?? 0,
        courseName: student.course,
        batchId: batch?.id ?? 0,
        batchName: student.batch,
        email: student.email,
        phone: student.phone,
        gender: student.gender,
        city: student.city,
        status: student.status,
        joinedDate: student.admissionDate,
        createdAt: student.admissionDate,
        updatedAt: student.admissionDate,
      }
    })
  })

  const attendanceReports = computed<AttendanceReportRow[]>(() => {
    return attendanceStore.items.map((item) => {
      const student = studentStore.getStudentById(item.studentId)
      const course =
        courseStore.getCourseById(item.courseId) ??
        (student ? courseStore.getCourseByName(student.course) : null)

      const batch =
        batchStore.getById(item.batchId) ??
        (student
          ? (batchStore.batches.find(
              (entry) => entry.name === student.batch && (!course || entry.courseId === course.id),
            ) ?? batchStore.batches.find((entry) => entry.name === student.batch))
          : null)

      return {
        id: item.id,
        studentId: item.studentId,
        studentName: student?.name ?? `Student ${item.studentId}`,
        courseId: course?.id ?? item.courseId,
        courseName: course?.name ?? 'Unknown Course',
        batchId: batch?.id ?? item.batchId,
        batchName: batch?.name ?? 'Unknown Batch',
        date: item.date,
        status: item.status,
        markedBy: item.markedBy || 'Admin',
        note: item.note || '',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }
    })
  })

  const examReports = computed<ExamReportRow[]>(() => {
    return examStore.marks.map((mark) => {
      const exam = examStore.getExamById(mark.examId)
      const student = studentStore.getStudentById(mark.studentId)
      const course =
        courseStore.getCourseById(exam?.courseId ?? 0) ??
        (student ? courseStore.getCourseByName(student.course) : null)

      const batch =
        batchStore.getById(exam?.batchId ?? mark.batchId) ??
        (student
          ? (batchStore.batches.find(
              (entry) => entry.name === student.batch && (!course || entry.courseId === course.id),
            ) ?? batchStore.batches.find((entry) => entry.name === student.batch))
          : null)

      const obtainedMarks = Number(mark.obtainedMarks || 0)
      const totalMarks = Number(exam?.totalMarks || 0)
      const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0

      return {
        id: mark.id,
        examId: mark.examId,
        examName: exam?.name ?? 'Unknown Exam',
        courseId: course?.id ?? exam?.courseId ?? 0,
        courseName: course?.name ?? 'Unknown Course',
        batchId: batch?.id ?? exam?.batchId ?? mark.batchId,
        batchName: batch?.name ?? 'Unknown Batch',
        studentId: mark.studentId,
        studentName: student?.name ?? `Student ${mark.studentId}`,
        obtainedMarks,
        totalMarks,
        percentage,
        result: mark.status,
        checkedBy: mark.checkedBy || 'Admin',
        examDate: exam?.examDate ?? '',
        createdAt: mark.createdAt,
        updatedAt: mark.updatedAt,
      }
    })
  })

  const feesReports = computed<FeesReportRow[]>(() => {
    return feesStore.fees.map((item) => {
      const student = studentStore.getStudentById(item.studentId)
      const course =
        courseStore.getCourseById(item.courseId) ??
        (student ? courseStore.getCourseByName(student.course) : null)

      const batch =
        batchStore.getById(item.batchId) ??
        (student
          ? (batchStore.batches.find(
              (entry) => entry.name === student.batch && (!course || entry.courseId === course.id),
            ) ?? batchStore.batches.find((entry) => entry.name === student.batch))
          : null)

      return {
        id: item.id,
        studentId: item.studentId,
        studentName: student?.name ?? `Student ${item.studentId}`,
        courseId: course?.id ?? item.courseId,
        courseName: course?.name ?? 'Unknown Course',
        batchId: batch?.id ?? item.batchId,
        batchName: batch?.name ?? 'Unknown Batch',
        totalFees: item.totalFees,
        paidAmount: item.paidAmount,
        pendingAmount: item.pendingAmount,
        paymentMethod: item.paymentMethod,
        status: item.status,
        receiptNo: item.receiptNo,
        dueDate: item.dueDate,
        note: item.note || '',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }
    })
  })

  // Filters: Students report
  function filterStudentReports(filters: ReportFilters): StudentReportRow[] {
    return studentReports.value.filter((row) => {
      if (filters.batchId && row.batchId !== filters.batchId) return false
      if (filters.courseId && row.courseId !== filters.courseId) return false
      if (filters.status && row.status !== filters.status) return false
      if (!inDateRange(row.joinedDate, filters.fromDate, filters.toDate)) return false

      return matchesSearch(
        [
          row.studentId,
          row.studentName,
          row.courseName,
          row.batchName,
          row.email,
          row.phone,
          row.gender,
          row.city,
          row.status,
        ],
        filters.search,
      )
    })
  }

  // Filters: Attendance report
  function filterAttendanceReports(filters: ReportFilters): AttendanceReportRow[] {
    return attendanceReports.value.filter((row) => {
      if (filters.batchId && row.batchId !== filters.batchId) return false
      if (filters.courseId && row.courseId !== filters.courseId) return false
      if (filters.status && row.status !== filters.status) return false
      if (
        filters.markedBy &&
        !row.markedBy.toLowerCase().includes(filters.markedBy.toLowerCase())
      ) {
        return false
      }
      if (!inDateRange(row.date, filters.fromDate, filters.toDate)) return false

      return matchesSearch(
        [
          row.id,
          row.studentId,
          row.studentName,
          row.courseName,
          row.batchName,
          row.status,
          row.markedBy,
          row.note,
        ],
        filters.search,
      )
    })
  }

  // Filters: Exam report
  function filterExamReports(filters: ReportFilters): ExamReportRow[] {
    return examReports.value.filter((row) => {
      if (filters.batchId && row.batchId !== filters.batchId) return false
      if (filters.courseId && row.courseId !== filters.courseId) return false
      if (filters.examId && row.examId !== filters.examId) return false
      if (filters.status && row.result !== filters.status) return false
      if (
        filters.checkedBy &&
        !row.checkedBy.toLowerCase().includes(filters.checkedBy.toLowerCase())
      ) {
        return false
      }
      if (!inDateRange(row.examDate, filters.fromDate, filters.toDate)) return false

      return matchesSearch(
        [
          row.examId,
          row.examName,
          row.studentId,
          row.studentName,
          row.courseName,
          row.batchName,
          row.obtainedMarks,
          row.totalMarks,
          row.percentage,
          row.result,
          row.checkedBy,
        ],
        filters.search,
      )
    })
  }

  // Filters: Fees report
  function filterFeesReports(filters: ReportFilters): FeesReportRow[] {
    return feesReports.value.filter((row) => {
      if (filters.batchId && row.batchId !== filters.batchId) return false
      if (filters.courseId && row.courseId !== filters.courseId) return false
      if (filters.status && row.status !== filters.status) return false
      if (filters.paymentMethod && row.paymentMethod !== filters.paymentMethod) return false
      if (!inDateRange(row.dueDate, filters.fromDate, filters.toDate)) return false

      return matchesSearch(
        [
          row.id,
          row.studentId,
          row.studentName,
          row.courseName,
          row.batchName,
          row.status,
          row.paymentMethod,
          row.receiptNo,
          row.totalFees,
          row.paidAmount,
          row.pendingAmount,
          row.note,
        ],
        filters.search,
      )
    })
  }

  // Summary widget: reports dashboard वर quick overview
  const summary = computed<ReportSummary>(() => {
    const totalStudents = studentReports.value.length
    const activeStudents = studentReports.value.filter((x) => x.status === 'Active').length
    const inactiveStudents = studentReports.value.filter((x) => x.status === 'Inactive').length

    const totalAttendance = attendanceReports.value.length
    const presentCount = attendanceReports.value.filter((x) => x.status === 'Present').length
    const absentCount = attendanceReports.value.filter((x) => x.status === 'Absent').length
    const lateCount = attendanceReports.value.filter((x) => x.status === 'Late').length
    const leaveCount = attendanceReports.value.filter((x) => x.status === 'Leave').length

    const totalExams = examReports.value.length
    const passCount = examReports.value.filter((x) => x.result === 'Pass').length
    const failCount = examReports.value.filter((x) => x.result === 'Fail').length
    const avgMarks =
      examReports.value.length > 0
        ? Math.round(
            examReports.value.reduce((sum, x) => sum + x.obtainedMarks, 0) /
              examReports.value.length,
          )
        : 0

    const totalFees = feesReports.value.reduce((sum, x) => sum + x.totalFees, 0)
    const totalCollected = feesReports.value.reduce((sum, x) => sum + x.paidAmount, 0)
    const totalPending = feesReports.value.reduce((sum, x) => sum + x.pendingAmount, 0)

    const paidFeeCount = feesReports.value.filter((x) => x.status === 'Paid').length
    const partialFeeCount = feesReports.value.filter((x) => x.status === 'Partial').length
    const pendingFeeCount = feesReports.value.filter((x) => x.status === 'Pending').length
    const overdueFeeCount = feesReports.value.filter((x) => x.status === 'Overdue').length

    return {
      totalStudents,
      activeStudents,
      inactiveStudents,
      totalAttendance,
      presentCount,
      absentCount,
      lateCount,
      leaveCount,
      totalExams,
      passCount,
      failCount,
      avgMarks,
      totalFees,
      totalCollected,
      totalPending,
      paidFeeCount,
      partialFeeCount,
      pendingFeeCount,
      overdueFeeCount,
    }
  })

  // Filters dropdown options (UI साठी)
  const studentStatuses = computed(() => ['Active', 'Inactive'])
  const attendanceStatuses = computed(() => ['Present', 'Absent', 'Late', 'Leave'])
  const examStatuses = computed(() => ['Pass', 'Fail'])
  const feeStatuses = computed(() => ['Paid', 'Partial', 'Pending', 'Overdue'])
  const paymentMethods = computed<PaymentMethod[]>(() => ['Cash', 'UPI', 'Card', 'Bank Transfer'])

  // Dropdown data: batches/courses/exams list (id+name)
  const batches = computed(() =>
    batchStore.batches.map((batch) => ({
      id: batch.id,
      name: batch.name,
    })),
  )

  const courses = computed(() =>
    courseStore.courses.map((course) => ({
      id: course.id,
      name: course.name,
    })),
  )

  const exams = computed(() =>
    examStore.exams.map((exam) => ({
      id: exam.id,
      name: exam.name,
    })),
  )

  return {
    init,

    studentReports,
    attendanceReports,
    examReports,
    feesReports,

    filterStudentReports,
    filterAttendanceReports,
    filterExamReports,
    filterFeesReports,

    summary,

    studentStatuses,
    attendanceStatuses,
    examStatuses,
    feeStatuses,
    paymentMethods,

    batches,
    courses,
    exams,
  }
})
