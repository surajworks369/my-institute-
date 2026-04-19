/**
 * `stores/examStore.ts` (Exams + Marks Store / Pinia)
 *
 * - **Purpose**: Manage exam schedules and mark entries (pass/fail).
 * - **Role in project**: Supplies exam/mark data and counts to exam pages, dashboard, and reports.
 * - **Logic type**:
 *   - localStorage persistence (`STORAGE_KEY`) — exams + marks saved together
 *   - Normalize and validate batch/course/student linkage
 *   - Seeded demo exams and marks
 *   - Prevent duplicate mark rows (examId + studentId) on create/update
 * - **File type**: Store (frontend / Pinia)
 *
 * Note: Validation is client-side today. With a backend/API:
 * - Exam schedules and marks can be managed server-side
 * - Pass/fail and mark clamping can be enforced on the server
 */

import { defineStore } from 'pinia'
import type {
  Exam,
  ExamCreateInput,
  ExamUpdateInput,
  ExamMark,
  ExamMarkCreateInput,
  ExamMarkUpdateInput,
  ExamStatus,
  ExamType,
  PassFail,
} from '@/types/exam'
import { calcPassFail, clampMarks, normalizeExamStatus, normalizeExamType } from '@/types/exam'
import {
  MASTER_EXAM_NAME_OPTIONS,
  MASTER_EXAM_STATUSES,
  MASTER_EXAM_TYPES,
} from '@/stores/erpMasterData'
import { useBatchesStore } from '@/stores/batchesStore'
import { useCourseStore } from '@/stores/courseStore'
import { useStudentStore } from '@/stores/studentsStore'
import type { Student } from '@/types/student'

// localStorage key for exams + marks persistence
const STORAGE_KEY = 'vbh_erp_exams_v3'

type StorageShape = {
  exams: Exam[]
  marks: ExamMark[]
}

function nowISO(): string {
  return new Date().toISOString()
}

function todayYMD(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function safeParseStorage(): StorageShape {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { exams: [], marks: [] }

    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return { exams: [], marks: [] }

    const obj = parsed as Partial<StorageShape>

    return {
      exams: Array.isArray(obj.exams) ? (obj.exams as Exam[]) : [],
      marks: Array.isArray(obj.marks) ? (obj.marks as ExamMark[]) : [],
    }
  } catch {
    return { exams: [], marks: [] }
  }
}

// Persist exams + marks together
function saveStorage(exams: Exam[], marks: ExamMark[]): void {
  const payload: StorageShape = { exams, marks }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!
}

function keyExamStudent(examId: number, studentId: number): string {
  return `${examId}__${studentId}`
}

export const useExamStore = defineStore('exams', {
  state: () => ({
    exams: [] as Exam[],
    marks: [] as ExamMark[],
    loaded: false,
  }),

  getters: {
    totalExams: (s) => s.exams.length,
    upcomingCount: (s) => s.exams.filter((e) => e.status === 'Upcoming').length,
    ongoingCount: (s) => s.exams.filter((e) => e.status === 'Ongoing').length,
    completedCount: (s) => s.exams.filter((e) => e.status === 'Completed').length,
    cancelledCount: (s) => s.exams.filter((e) => e.status === 'Cancelled').length,

    totalMarksEntries: (s) => s.marks.length,
    passCount: (s) => s.marks.filter((m) => m.status === 'Pass').length,
    failCount: (s) => s.marks.filter((m) => m.status === 'Fail').length,

    getExamById: (s) => (id: number) => s.exams.find((e) => e.id === id) ?? null,
    getMarkById: (s) => (id: number) => s.marks.find((m) => m.id === id) ?? null,

    marksByExam: (s) => (examId: number) => s.marks.filter((m) => m.examId === examId),
    marksByStudent: (s) => (studentId: number) => s.marks.filter((m) => m.studentId === studentId),

    hasMarkEntry:
      (s) =>
      (examId: number, studentId: number): boolean => {
        return s.marks.some(
          (m) => keyExamStudent(m.examId, m.studentId) === keyExamStudent(examId, studentId),
        )
      },
  },

  actions: {
    // Init: related stores init + storage normalize/seed
    init(force = false): void {
      if (this.loaded && !force) return

      const batchStore = useBatchesStore()
      const courseStore = useCourseStore()
      const studentStore = useStudentStore()

      batchStore.init()
      courseStore.init()
      studentStore.init()

      const stored = safeParseStorage()
      const normalizedExams = this.normalizeExams(stored.exams)
      const normalizedMarks = this.normalizeMarks(stored.marks, normalizedExams)

      if (normalizedExams.length) {
        this.exams = normalizedExams
        this.marks = normalizedMarks
      } else {
        this.exams = this.seedExams(21)
        this.marks = this.seedMarksForExams(this.exams, 21)
      }

      this.loaded = true
      saveStorage(this.exams, this.marks)
    },

    // Storage normalize: batch/course existence validate + marks constraints fix
    normalizeExams(exams: Exam[]): Exam[] {
      const batchStore = useBatchesStore()
      const courseStore = useCourseStore()

      return exams
        .map((exam) => {
          const batch = batchStore.getById(Number(exam.batchId))
          let courseId = Number(exam.courseId)

          if (batch && batch.courseId > 0) {
            courseId = batch.courseId
          }

          const course = courseStore.getCourseById(courseId)
          if (!batch || !course) return null

          const totalMarks = Math.max(1, Number(exam.totalMarks))
          const passingMarks = Math.max(0, Math.min(Number(exam.passingMarks), totalMarks))

          return {
            ...exam,
            courseId: course.id,
            batchId: batch.id,
            type: normalizeExamType(exam.type),
            status: normalizeExamStatus(exam.status),
            totalMarks,
            passingMarks,
            instructions: String(exam.instructions ?? ''),
            createdAt: String(exam.createdAt ?? nowISO()),
            updatedAt: String(exam.updatedAt ?? nowISO()),
          }
        })
        .filter((item): item is Exam => Boolean(item))
    },

    // Storage normalize: validate student/exam links in marks and drop duplicates
    normalizeMarks(marks: ExamMark[], exams: Exam[]): ExamMark[] {
      const examMap = new Map(exams.map((exam) => [exam.id, exam]))
      const studentStore = useStudentStore()
      const result: ExamMark[] = []
      const used = new Set<string>()

      for (const mark of marks) {
        const exam = examMap.get(Number(mark.examId))
        const student = studentStore.getStudentById(Number(mark.studentId))
        if (!exam || !student) continue

        if (!this.isStudentLinkedToExam(student, exam)) continue

        const key = keyExamStudent(exam.id, student.id)
        if (used.has(key)) continue
        used.add(key)

        const obtainedMarks = clampMarks(Number(mark.obtainedMarks), 0, exam.totalMarks)

        result.push({
          id: Number(mark.id),
          examId: exam.id,
          studentId: student.id,
          batchId: exam.batchId,
          obtainedMarks,
          status: calcPassFail(obtainedMarks, exam.passingMarks),
          checkedBy: String(mark.checkedBy ?? 'Admin').trim() || 'Admin',
          note: String(mark.note ?? ''),
          createdAt: String(mark.createdAt ?? nowISO()),
          updatedAt: String(mark.updatedAt ?? nowISO()),
        })
      }

      return result.filter((item) => item.id > 0)
    },

    // Exam form linkage helper: do batchId and courseId align?
    resolveExamLink(courseId: number, batchId: number) {
      const batchStore = useBatchesStore()
      const courseStore = useCourseStore()

      const batch = batchStore.getById(Number(batchId))
      if (!batch) {
        return { batch: null, course: null }
      }

      const course =
        courseStore.getCourseById(Number(courseId)) ?? courseStore.getCourseById(batch.courseId)

      if (!course) {
        return { batch: null, course: null }
      }

      if (batch.courseId !== course.id) {
        return { batch: null, course: null }
      }

      return { batch, course }
    },

    // Exam create/update validate
    validateExamLink(courseId: number, batchId: number): boolean {
      const { batch, course } = this.resolveExamLink(courseId, batchId)
      return Boolean(batch && course)
    },

    // Validate that the student belongs to the exam's course + batch
    isStudentLinkedToExam(student: Student, exam: Exam): boolean {
      const batchStore = useBatchesStore()
      const courseStore = useCourseStore()

      const batch = batchStore.getById(exam.batchId)
      const course = courseStore.getCourseById(exam.courseId)

      if (!batch || !course) return false
      if (student.course !== course.name) return false
      if (student.batch !== batch.name) return false

      return true
    },

    // Marks create/update validate: examId+studentId link check
    validateMarkLink(examId: number, studentId: number): boolean {
      const exam = this.exams.find((e) => e.id === examId) ?? null
      if (!exam) return false

      const studentStore = useStudentStore()
      const student = studentStore.getStudentById(studentId)
      if (!student) return false

      return this.isStudentLinkedToExam(student, exam)
    },

    // Seed/demo exams list
    seedExams(count = 21): Exam[] {
      const batchStore = useBatchesStore()
      const courseStore = useCourseStore()

      const activeBatches = batchStore.batches.filter((batch) => batch.courseId > 0)
      const batches = activeBatches.length ? activeBatches : batchStore.batches

      if (!batches.length) return []

      const base = nowISO()

      return Array.from({ length: count }, (_, i): Exam => {
        const batch = pick(batches, i)
        const course = courseStore.getCourseById(batch.courseId)
        const type = pick(MASTER_EXAM_TYPES, i) as ExamType
        const status = pick(MASTER_EXAM_STATUSES, i) as ExamStatus

        const totalMarks = type === 'Practical' ? 50 : 100
        const passingMarks = type === 'Final' ? 40 : 35

        const examDate =
          status === 'Upcoming'
            ? todayYMD(3 + (i % 8))
            : status === 'Ongoing'
              ? todayYMD(0)
              : todayYMD(-(2 + (i % 9)))

        return {
          id: i + 1,
          name: `${pick(MASTER_EXAM_NAME_OPTIONS, i)} - ${String.fromCharCode(65 + (i % 4))}`,
          code: `EXM-${String(101 + i)}`,
          courseId: course?.id ?? batch.courseId,
          batchId: batch.id,
          type,
          status,
          examDate,
          startTime: i % 2 === 0 ? '10:00' : '14:00',
          endTime: i % 2 === 0 ? '12:00' : '16:00',
          totalMarks,
          passingMarks,
          instructions: 'Bring ID card. Follow institute exam rules.',
          createdAt: base,
          updatedAt: base,
        }
      })
    },

    // Seed/demo marks: generate sample marks from exams + linked students
    seedMarksForExams(exams: Exam[], count = 21): ExamMark[] {
      const studentStore = useStudentStore()
      const base = nowISO()

      const result: ExamMark[] = []
      const used = new Set<string>()
      let pointer = 0
      let safety = 0

      while (result.length < count && exams.length && safety < 5000) {
        safety++

        const exam = exams[pointer % exams.length]
        if (!exam) {
          pointer++
          continue
        }

        const linkedStudents = studentStore.students.filter((student) =>
          this.isStudentLinkedToExam(student, exam),
        )

        if (!linkedStudents.length) {
          pointer++
          continue
        }

        const student = linkedStudents[pointer % linkedStudents.length]
        if (!student) {
          pointer++
          continue
        }

        const key = keyExamStudent(exam.id, student.id)
        if (used.has(key)) {
          pointer++
          continue
        }
        used.add(key)

        const obtainedMarks = clampMarks(20 + (pointer % (exam.totalMarks + 1)), 0, exam.totalMarks)

        result.push({
          id: result.length + 1,
          examId: exam.id,
          studentId: student.id,
          batchId: exam.batchId,
          obtainedMarks,
          status: calcPassFail(obtainedMarks, exam.passingMarks),
          checkedBy: 'Admin',
          note: '',
          createdAt: base,
          updatedAt: base,
        })

        pointer++
      }

      return result
    },

    // CRUD: create exam
    createExam(payload: ExamCreateInput): Exam | null {
      if (!this.validateExamLink(Number(payload.courseId), Number(payload.batchId))) return null

      const maxId = this.exams.reduce((m, e) => Math.max(m, e.id), 0)
      const totalMarks = Math.max(1, Number(payload.totalMarks))
      const passingMarks = Math.max(0, Math.min(Number(payload.passingMarks), totalMarks))

      const created: Exam = {
        ...payload,
        id: maxId + 1,
        courseId: Number(payload.courseId),
        batchId: Number(payload.batchId),
        type: normalizeExamType(payload.type),
        status: normalizeExamStatus(payload.status),
        totalMarks,
        passingMarks,
        instructions: String(payload.instructions ?? '').trim(),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      }

      this.exams.unshift(created)
      saveStorage(this.exams, this.marks)
      return created
    },

    // CRUD: update exam + linked marks re-validate/recompute
    updateExam(id: number, patch: ExamUpdateInput): Exam | null {
      const index = this.exams.findIndex((e) => e.id === id)
      if (index === -1) return null

      const current = this.exams[index]
      if (!current) return null

      const nextCourseId = Number(patch.courseId ?? current.courseId)
      const nextBatchId = Number(patch.batchId ?? current.batchId)

      if (!this.validateExamLink(nextCourseId, nextBatchId)) return null

      const totalMarks = Math.max(1, Number(patch.totalMarks ?? current.totalMarks))
      const passingMarks = Math.max(
        0,
        Math.min(Number(patch.passingMarks ?? current.passingMarks), totalMarks),
      )

      const updated: Exam = {
        id: current.id,
        name: String(patch.name ?? current.name).trim(),
        code: String(patch.code ?? current.code).trim(),
        courseId: nextCourseId,
        batchId: nextBatchId,
        type: normalizeExamType(patch.type ?? current.type),
        status: normalizeExamStatus(patch.status ?? current.status),
        examDate: String(patch.examDate ?? current.examDate),
        startTime: String(patch.startTime ?? current.startTime),
        endTime: String(patch.endTime ?? current.endTime),
        totalMarks,
        passingMarks,
        instructions: String(patch.instructions ?? current.instructions).trim(),
        createdAt: current.createdAt,
        updatedAt: nowISO(),
      }

      this.exams[index] = updated

      this.marks = this.marks
        .filter((mark) => {
          const studentStore = useStudentStore()
          const student = studentStore.getStudentById(mark.studentId)
          if (!student) return false
          if (mark.examId !== updated.id) return true
          return this.isStudentLinkedToExam(student, updated)
        })
        .map((mark) => {
          if (mark.examId !== updated.id) return mark

          const obtainedMarks = clampMarks(mark.obtainedMarks, 0, updated.totalMarks)
          return {
            ...mark,
            batchId: updated.batchId,
            obtainedMarks,
            status: calcPassFail(obtainedMarks, updated.passingMarks),
            updatedAt: nowISO(),
          }
        })

      saveStorage(this.exams, this.marks)
      return updated
    },

    // CRUD: delete exam (and related marks)
    removeExam(id: number): boolean {
      const before = this.exams.length
      this.exams = this.exams.filter((e) => e.id !== id)
      this.marks = this.marks.filter((m) => m.examId !== id)
      saveStorage(this.exams, this.marks)
      return this.exams.length !== before
    },

    // Status helper
    setExamStatus(id: number, status: ExamStatus): void {
      this.updateExam(id, { status })
    },

    // CRUD: create mark entry (avoid duplicate examId + studentId)
    createMark(payload: ExamMarkCreateInput): ExamMark | null {
      const exam = this.exams.find((e) => e.id === payload.examId) ?? null
      if (!exam) return null
      if (!this.validateMarkLink(payload.examId, payload.studentId)) return null
      if (this.hasMarkEntry(payload.examId, payload.studentId)) return null

      const maxId = this.marks.reduce((m, x) => Math.max(m, x.id), 0)
      const obtainedMarks = clampMarks(Number(payload.obtainedMarks), 0, exam.totalMarks)

      const created: ExamMark = {
        id: maxId + 1,
        examId: exam.id,
        studentId: Number(payload.studentId),
        batchId: exam.batchId,
        obtainedMarks,
        status: payload.status ?? calcPassFail(obtainedMarks, exam.passingMarks),
        checkedBy: String(payload.checkedBy ?? 'Admin').trim() || 'Admin',
        note: String(payload.note ?? '').trim(),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      }

      this.marks.unshift(created)
      saveStorage(this.exams, this.marks)
      return created
    },

    // CRUD: update mark entry (link + duplicates validate)
    updateMark(id: number, patch: ExamMarkUpdateInput): ExamMark | null {
      const index = this.marks.findIndex((m) => m.id === id)
      if (index === -1) return null

      const current = this.marks[index]
      if (!current) return null

      const nextExamId = Number(patch.examId ?? current.examId)
      const nextStudentId = Number(patch.studentId ?? current.studentId)

      if (!this.validateMarkLink(nextExamId, nextStudentId)) return null

      const keyNow = keyExamStudent(current.examId, current.studentId)
      const keyNext = keyExamStudent(nextExamId, nextStudentId)

      if (
        keyNow !== keyNext &&
        this.marks.some((m) => keyExamStudent(m.examId, m.studentId) === keyNext)
      ) {
        return null
      }

      const exam = this.exams.find((e) => e.id === nextExamId) ?? null
      if (!exam) return null

      const obtainedMarks = clampMarks(
        Number(patch.obtainedMarks ?? current.obtainedMarks),
        0,
        exam.totalMarks,
      )

      const updated: ExamMark = {
        id: current.id,
        examId: nextExamId,
        studentId: nextStudentId,
        batchId: exam.batchId,
        obtainedMarks,
        status: patch.status ?? calcPassFail(obtainedMarks, exam.passingMarks),
        checkedBy: String(patch.checkedBy ?? current.checkedBy).trim() || 'Admin',
        note: String(patch.note ?? current.note).trim(),
        createdAt: current.createdAt,
        updatedAt: nowISO(),
      }

      this.marks[index] = updated
      saveStorage(this.exams, this.marks)
      return updated
    },

    // CRUD: delete mark
    removeMark(id: number): boolean {
      const before = this.marks.length
      this.marks = this.marks.filter((m) => m.id !== id)
      saveStorage(this.exams, this.marks)
      return this.marks.length !== before
    },

    // Reset: restore demo seed data
    resetToSeed(count = 21): void {
      this.exams = this.seedExams(count)
      this.marks = this.seedMarksForExams(this.exams, count)
      this.loaded = true
      saveStorage(this.exams, this.marks)
    },
  },
})
