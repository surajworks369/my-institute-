/**
 * `stores/attendanceStore.ts` (Attendance Store / Pinia)
 *
 * - **Purpose**: Manage attendance records (mark/edit/delete) and expose counts/distributions.
 * - **Role in project**: Feeds attendance pages and the dashboard with rows and summaries.
 * - **Logic type**:
 *   - localStorage persistence (`STORAGE_KEY`)
 *   - Normalize records (validate student/course/batch linkage)
 *   - Seeded demo data
 *   - Prevent duplicate rows (date + batch + student) on create/update
 * - **File type**: Store (frontend / Pinia)
 *
 * Note: Linkage validation is client-only today. With a backend/API, uniqueness constraints and
 * init/create/update can move to API calls.
 */

import { defineStore } from 'pinia'
import type {
  Attendance,
  AttendanceCreateInput,
  AttendanceStatus,
  AttendanceUpdateInput,
} from '@/types/attendance'
import type { Student } from '@/types/student'
import { useBatchesStore } from '@/stores/batchesStore'
import { useCourseStore } from '@/stores/courseStore'
import { useStudentStore } from '@/stores/studentsStore'

// localStorage key for attendance persistence
const STORAGE_KEY = 'vbh_erp_attendance_v3'

// Timestamp helper (createdAt/updatedAt)
function nowISO(): string {
  return new Date().toISOString()
}

// Date helpers: normalize to YYYY-MM-DD for filters and unique keys
function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function todayYMD(): string {
  return toYMD(new Date())
}

// Seed/demo: shift a base date back by N days
function shiftDate(base: string, days: number): string {
  const dt = new Date(base)
  dt.setDate(dt.getDate() - days)
  return toYMD(dt)
}

// localStorage → attendance load
function loadFromStorage(): Attendance[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as Attendance[]) : []
  } catch {
    return []
  }
}

// attendance persist
function saveToStorage(items: Attendance[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

// Unique key: only one row per date + batchId + studentId
function uniqueKey(date: string, batchId: number, studentId: number): string {
  return `${date}__${batchId}__${studentId}`
}

// Seed/demo: deterministic-ish status pick
function pickStatus(i: number): AttendanceStatus {
  if (i % 11 === 0) return 'Absent'
  if (i % 7 === 0) return 'Late'
  if (i % 13 === 0) return 'Leave'
  return 'Present'
}

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    items: [] as Attendance[],
    loaded: false,
  }),

  getters: {
    total: (s) => s.items.length,
    presentCount: (s) => s.items.filter((x) => x.status === 'Present').length,
    absentCount: (s) => s.items.filter((x) => x.status === 'Absent').length,
    lateCount: (s) => s.items.filter((x) => x.status === 'Late').length,
    leaveCount: (s) => s.items.filter((x) => x.status === 'Leave').length,
    getById: (s) => (id: number) => s.items.find((x) => x.id === id) ?? null,
  },

  actions: {
    // Init: related stores init (students/courses/batches) + storage normalize/seed
    init(force = false): void {
      if (this.loaded && !force) return

      const courseStore = useCourseStore()
      const batchStore = useBatchesStore()
      const studentStore = useStudentStore()

      courseStore.init()
      batchStore.init()
      studentStore.init()

      const stored = loadFromStorage()
      const normalized = this.normalizeRecords(stored)

      this.items = normalized.length ? normalized : this.seed()
      this.loaded = true
      saveToStorage(this.items)
    },

    // Safe status normalize (unknown → Present)
    normalizeStatus(status: unknown): AttendanceStatus {
      if (status === 'Present' || status === 'Absent' || status === 'Late' || status === 'Leave') {
        return status
      }
      return 'Present'
    },

    // Stored records normalize:
    // - Ensure the student exists
    // - Resolve course/batch (by id or student data)
    // - Drop duplicate entries
    normalizeRecords(records: Attendance[]): Attendance[] {
      const courseStore = useCourseStore()
      const batchStore = useBatchesStore()
      const studentStore = useStudentStore()

      const normalized: Attendance[] = []

      for (const raw of records) {
        const studentId = Number(raw?.studentId ?? 0)
        const student = studentStore.getStudentById(studentId)
        if (!student) continue

        const resolvedCourse =
          courseStore.getCourseById(Number((raw as Partial<Attendance>).courseId ?? 0)) ??
          courseStore.getCourseByName(student.course)

        const candidateBatchId = Number((raw as Partial<Attendance>).batchId ?? 0)

        const resolvedBatch =
          batchStore.getById(candidateBatchId) ??
          batchStore.batches.find(
            (batch) =>
              batch.name === student.batch &&
              (!resolvedCourse || batch.courseId === resolvedCourse.id),
          ) ??
          batchStore.batches.find((batch) => batch.name === student.batch)

        if (!resolvedCourse || !resolvedBatch) continue

        const key = uniqueKey(String(raw.date ?? todayYMD()), resolvedBatch.id, student.id)
        if (normalized.some((item) => uniqueKey(item.date, item.batchId, item.studentId) === key)) {
          continue
        }

        normalized.push({
          id: Number(raw.id),
          date: String(raw.date ?? todayYMD()),
          courseId: resolvedCourse.id,
          batchId: resolvedBatch.id,
          studentId: student.id,
          status: this.normalizeStatus(raw.status),
          note: String(raw.note ?? ''),
          markedBy: String(raw.markedBy ?? 'Admin'),
          createdAt: String(raw.createdAt ?? nowISO()),
          updatedAt: String(raw.updatedAt ?? nowISO()),
        })
      }

      return normalized
        .filter((item) => item.id > 0)
        .sort((a, b) => {
          if (a.date === b.date) return b.id - a.id
          return a.date < b.date ? 1 : -1
        })
    },

    // UI helper: resolve linked course/batch from a selected studentId
    getLinkedData(studentId: number, courseId?: number, batchId?: number) {
      const courseStore = useCourseStore()
      const batchStore = useBatchesStore()
      const studentStore = useStudentStore()

      const student = studentStore.getStudentById(studentId)
      if (!student) {
        return {
          student: null,
          course: null,
          batch: null,
        }
      }

      const linkedCourse =
        courseStore.getCourseById(Number(courseId ?? 0)) ??
        courseStore.getCourseByName(student.course)

      const linkedBatch =
        batchStore.getById(Number(batchId ?? 0)) ??
        batchStore.batches.find(
          (batch) =>
            batch.name === student.batch && (!linkedCourse || batch.courseId === linkedCourse.id),
        ) ??
        batchStore.batches.find((batch) => batch.name === student.batch)

      return {
        student,
        course: linkedCourse ?? null,
        batch: linkedBatch ?? null,
      }
    },

    // Validate selections to avoid student/course/batch mismatches on create/update
    validateLinkedSelection(payload: {
      studentId: number
      courseId: number
      batchId: number
    }): boolean {
      const { student, course, batch } = this.getLinkedData(
        payload.studentId,
        payload.courseId,
        payload.batchId,
      )

      if (!student || !course || !batch) return false
      if (student.course !== course.name) return false
      if (student.batch !== batch.name) return false
      if (batch.courseId !== course.id) return false

      return true
    },

    // Duplicate check: same date + batch + student (`excludeId` for updates)
    hasEntry(date: string, batchId: number, studentId: number, excludeId = 0): boolean {
      const key = uniqueKey(date, batchId, studentId)
      return this.items.some(
        (x) => x.id !== excludeId && uniqueKey(x.date, x.batchId, x.studentId) === key,
      )
    },

    // Seed/demo: build sample rows from the student list
    seed(count?: number): Attendance[] {
      const studentStore = useStudentStore()
      const courseStore = useCourseStore()
      const batchStore = useBatchesStore()

      const students = [...studentStore.students] as Student[]
      if (!students.length) return []

      const baseDate = todayYMD()
      const maxCount = Math.min(count ?? Math.max(students.length, 18), students.length)

      const result: Attendance[] = []
      const used = new Set<string>()
      let pointer = 0
      let safety = 0

      while (result.length < maxCount && safety < students.length * 10) {
        safety++

        const student = students[pointer % students.length]
        if (!student) {
          pointer++
          continue
        }

        const course = courseStore.getCourseByName(student.course)
        if (!course) {
          pointer++
          continue
        }

        const batch =
          batchStore.batches.find(
            (item) => item.name === student.batch && item.courseId === course.id,
          ) ?? batchStore.batches.find((item) => item.name === student.batch)

        if (!batch) {
          pointer++
          continue
        }

        const date = shiftDate(baseDate, pointer % 5)
        const key = uniqueKey(date, batch.id, student.id)

        if (!used.has(key)) {
          used.add(key)

          result.push({
            id: result.length + 1,
            date,
            courseId: course.id,
            batchId: batch.id,
            studentId: student.id,
            status: pickStatus(pointer + 1),
            note: '',
            markedBy: 'Admin',
            createdAt: nowISO(),
            updatedAt: nowISO(),
          })
        }

        pointer++
      }

      return result.sort((a, b) => {
        if (a.date === b.date) return b.id - a.id
        return a.date < b.date ? 1 : -1
      })
    },

    // CRUD: create attendance (validation + duplicate check)
    create(payload: AttendanceCreateInput): Attendance | null {
      const valid = this.validateLinkedSelection({
        studentId: Number(payload.studentId),
        courseId: Number(payload.courseId),
        batchId: Number(payload.batchId),
      })

      if (!valid) return null
      if (this.hasEntry(payload.date, payload.batchId, payload.studentId)) return null

      const maxId = this.items.reduce((m, x) => Math.max(m, x.id), 0)

      const created: Attendance = {
        id: maxId + 1,
        date: payload.date,
        courseId: Number(payload.courseId),
        batchId: Number(payload.batchId),
        studentId: Number(payload.studentId),
        status: this.normalizeStatus(payload.status),
        note: String(payload.note ?? '').trim(),
        markedBy: String(payload.markedBy ?? 'Admin').trim() || 'Admin',
        createdAt: nowISO(),
        updatedAt: nowISO(),
      }

      this.items.unshift(created)
      saveToStorage(this.items)
      return created
    },

    // CRUD: update attendance (validation + duplicate check)
    update(id: number, patch: AttendanceUpdateInput): Attendance | null {
      const index = this.items.findIndex((x) => x.id === id)
      if (index === -1) return null

      const current = this.items[index]
      if (!current) return null

      const nextDate = patch.date ?? current.date
      const nextCourseId = Number(patch.courseId ?? current.courseId)
      const nextBatchId = Number(patch.batchId ?? current.batchId)
      const nextStudentId = Number(patch.studentId ?? current.studentId)

      const valid = this.validateLinkedSelection({
        studentId: nextStudentId,
        courseId: nextCourseId,
        batchId: nextBatchId,
      })

      if (!valid) return null
      if (this.hasEntry(nextDate, nextBatchId, nextStudentId, id)) return null

      const updated: Attendance = {
        id: current.id,
        date: nextDate,
        courseId: nextCourseId,
        batchId: nextBatchId,
        studentId: nextStudentId,
        status: this.normalizeStatus(patch.status ?? current.status),
        note: String(patch.note ?? current.note ?? '').trim(),
        markedBy: String(patch.markedBy ?? current.markedBy ?? 'Admin').trim() || 'Admin',
        createdAt: current.createdAt,
        updatedAt: nowISO(),
      }

      this.items[index] = updated
      saveToStorage(this.items)
      return updated
    },

    // CRUD: delete single record
    remove(id: number): boolean {
      const before = this.items.length
      this.items = this.items.filter((x) => x.id !== id)
      saveToStorage(this.items)
      return this.items.length !== before
    },

    // CRUD: bulk delete
    removeMany(ids: number[]): Attendance[] {
      if (!ids.length) return []

      const idSet = new Set(ids)
      const removed = this.items.filter((item) => idSet.has(item.id))
      this.items = this.items.filter((item) => !idSet.has(item.id))
      saveToStorage(this.items)
      return removed
    },

    // Undo/restore: restore backup rows (avoid id/key clashes)
    restoreMany(records: Attendance[]): boolean {
      if (!records.length) return false

      const existingIds = new Set(this.items.map((item) => item.id))
      const uniqueCurrentKeys = new Set(
        this.items.map((item) => uniqueKey(item.date, item.batchId, item.studentId)),
      )

      const validRecords = records.filter((record) => {
        if (existingIds.has(record.id)) return false
        const key = uniqueKey(record.date, record.batchId, record.studentId)
        if (uniqueCurrentKeys.has(key)) return false
        return true
      })

      if (!validRecords.length) return false

      this.items = [...validRecords, ...this.items].sort((a, b) => {
        if (a.date === b.date) return b.id - a.id
        return a.date < b.date ? 1 : -1
      })

      saveToStorage(this.items)
      return true
    },

    // Reset: restore demo seed data
    resetToSeed(count?: number): void {
      this.items = this.seed(count)
      this.loaded = true
      saveToStorage(this.items)
    },
  },
})
