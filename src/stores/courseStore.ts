/**
 * `stores/courseStore.ts` (Courses Store / Pinia)
 *
 * - **कशासाठी**: Courses module साठी data (list + CRUD) आणि dropdown options (duration/trainers) manage करणे.
 * - **Project मधली role**: Courses pages + students/batches modules ला course reference data देतो.
 * - **Logic प्रकार**:
 *   - localStorage persistence (`STORAGE_KEY`)
 *   - seed course list + stored courses normalize (seed + stored merge)
 *   - enrollment sync (studentsStore मधून counts)
 * - **File प्रकार**: store (frontend / Pinia)
 *
 * Note: सध्या course definitions frontend/localStorage मध्ये आहेत. पुढे backend/API आल्यावर
 * `init/add/update/delete` API calls होऊ शकतात, आणि server-side validation लागू होईल.
 */

import { defineStore } from 'pinia'
import {
  MASTER_COURSE_NAMES,
  MASTER_DURATION_OPTIONS,
  MASTER_TRAINERS,
} from '@/stores/erpMasterData'
import type { Student } from '@/types/student'

export interface Course {
  id: number
  name: string
  code: string
  duration: string
  fees: number
  status: 'Active' | 'Inactive'
  description: string
  startDate: string
  endDate: string
  maxStudents: number
  enrolledStudents: number
  batch: string
  trainer: string
  assistantTrainer: string
}

export type CourseFormData = Omit<Course, 'id' | 'enrolledStudents'> & {
  enrolledStudents?: number
}

const STORAGE_KEY = 'vbh_courses_v4'

// Master dropdown options (forms साठी)
export const durationOptions = [...MASTER_DURATION_OPTIONS]
export const trainerOptions = [...MASTER_TRAINERS]

const batchOptions = ['Morning', 'Afternoon', 'Evening'] as const

const courseBlueprints: Record<string, Omit<Course, 'id' | 'name' | 'enrolledStudents'>> = {
  'Full Stack Development': {
    code: 'VBC101',
    duration: '6 Months',
    fees: 32000,
    status: 'Active',
    description:
      'Covers frontend, backend, APIs, databases, deployment, and practical full-stack projects.',
    startDate: '2025-01-10',
    endDate: '2025-07-10',
    maxStudents: 40,
    batch: 'Morning',
    trainer: 'Amit Sir',
    assistantTrainer: 'Priya Ma’am',
  },
  'Data Science': {
    code: 'VBC102',
    duration: '6 Months',
    fees: 36000,
    status: 'Active',
    description:
      'Includes Python, data analysis, machine learning basics, visualization, and project work.',
    startDate: '2025-02-01',
    endDate: '2025-08-01',
    maxStudents: 35,
    batch: 'Afternoon',
    trainer: 'Rahul Sir',
    assistantTrainer: 'Sneha Ma’am',
  },
  'UI/UX Design': {
    code: 'VBC103',
    duration: '3 Months',
    fees: 22000,
    status: 'Active',
    description:
      'Focuses on user research, wireframes, design systems, prototyping, and practical UI workflows.',
    startDate: '2025-01-20',
    endDate: '2025-04-20',
    maxStudents: 30,
    batch: 'Evening',
    trainer: 'Pooja Ma’am',
    assistantTrainer: 'Priya Ma’am',
  },
  'Cyber Security': {
    code: 'VBC104',
    duration: '6 Months',
    fees: 34000,
    status: 'Inactive',
    description:
      'Covers fundamentals of network security, ethical hacking basics, system protection, and awareness.',
    startDate: '2025-03-05',
    endDate: '2025-09-05',
    maxStudents: 28,
    batch: 'Morning',
    trainer: 'Rahul Sir',
    assistantTrainer: 'Kiran Sir',
  },
  'Digital Marketing': {
    code: 'VBC105',
    duration: '3 Months',
    fees: 18000,
    status: 'Active',
    description:
      'Includes SEO, social media, performance marketing, content strategy, and campaign reporting.',
    startDate: '2025-02-15',
    endDate: '2025-05-15',
    maxStudents: 32,
    batch: 'Afternoon',
    trainer: 'Sneha Ma’am',
    assistantTrainer: 'Pooja Ma’am',
  },
  'Graphic Design': {
    code: 'VBC106',
    duration: '3 Months',
    fees: 20000,
    status: 'Active',
    description:
      'Covers branding, posters, social creatives, typography, composition, and design software practice.',
    startDate: '2025-01-12',
    endDate: '2025-04-12',
    maxStudents: 30,
    batch: 'Evening',
    trainer: 'Priya Ma’am',
    assistantTrainer: 'Sneha Ma’am',
  },
  'Tally & GST': {
    code: 'VBC107',
    duration: '2 Months',
    fees: 16000,
    status: 'Active',
    description:
      'Practical accounting course with Tally operations, GST entries, invoicing, and business workflows.',
    startDate: '2025-03-01',
    endDate: '2025-05-01',
    maxStudents: 36,
    batch: 'Morning',
    trainer: 'Kiran Sir',
    assistantTrainer: 'Priya Ma’am',
  },
  'MS-CIT Advanced': {
    code: 'VBC108',
    duration: '2 Months',
    fees: 14000,
    status: 'Inactive',
    description:
      'Advanced digital literacy course with office productivity, internet tools, and practical system usage.',
    startDate: '2025-02-10',
    endDate: '2025-04-10',
    maxStudents: 40,
    batch: 'Afternoon',
    trainer: 'Amit Sir',
    assistantTrainer: 'Sneha Ma’am',
  },
  'Web Development': {
    code: 'VBC109',
    duration: '3 Months',
    fees: 24000,
    status: 'Active',
    description:
      'Focuses on HTML, CSS, JavaScript, responsive layouts, and mini web projects for beginners.',
    startDate: '2025-01-25',
    endDate: '2025-04-25',
    maxStudents: 34,
    batch: 'Evening',
    trainer: 'Amit Sir',
    assistantTrainer: 'Rahul Sir',
  },
  'Mobile App Development': {
    code: 'VBC110',
    duration: '6 Months',
    fees: 33000,
    status: 'Active',
    description:
      'Covers mobile app design, Flutter basics, state management, API integration, and deployment concepts.',
    startDate: '2025-03-12',
    endDate: '2025-09-12',
    maxStudents: 30,
    batch: 'Morning',
    trainer: 'Rahul Sir',
    assistantTrainer: 'Pooja Ma’am',
  },
  'Python Programming': {
    code: 'VBC111',
    duration: '3 Months',
    fees: 21000,
    status: 'Active',
    description:
      'Practical Python course covering syntax, logic, functions, files, and beginner project development.',
    startDate: '2025-02-18',
    endDate: '2025-05-18',
    maxStudents: 35,
    batch: 'Afternoon',
    trainer: 'Kiran Sir',
    assistantTrainer: 'Amit Sir',
  },
  'Video Editing': {
    code: 'VBC112',
    duration: '2 Months',
    fees: 17000,
    status: 'Inactive',
    description:
      'Includes editing workflow, cuts, transitions, audio cleanup, reels, and promotional video creation.',
    startDate: '2025-01-08',
    endDate: '2025-03-08',
    maxStudents: 26,
    batch: 'Evening',
    trainer: 'Sneha Ma’am',
    assistantTrainer: 'Priya Ma’am',
  },
}

// localStorage → courses load
function loadFromStorage(): Course[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as Course[]) : []
  } catch {
    return []
  }
}

// courses persist
function saveToStorage(courses: Course[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
}

// Seed courses: master names वरून default course objects बनवतो
function buildSeedCourses(): Course[] {
  return MASTER_COURSE_NAMES.map((courseName, index) => {
    const blueprint = courseBlueprints[courseName] ?? {
      code: `VBC${String(index + 101).padStart(3, '0')}`,
      duration: '3 Months',
      fees: 20000,
      status: 'Active' as const,
      description: 'Professional institute course.',
      startDate: '2025-01-01',
      endDate: '2025-04-01',
      maxStudents: 30,
      batch: batchOptions[index % batchOptions.length] ?? 'Morning',
      trainer: trainerOptions[index % trainerOptions.length] ?? 'Amit Sir',
      assistantTrainer: trainerOptions[(index + 1) % trainerOptions.length] ?? 'Priya Ma’am',
    }

    return {
      id: index + 1,
      name: courseName,
      ...blueprint,
      enrolledStudents: 0,
    }
  })
}

// Stored courses ला seed सोबत align/merge (missing seeds add; extra stored keep)
function normalizeCourses(stored: Course[]): Course[] {
  const seedCourses = buildSeedCourses()
  const seedByName = new Map(seedCourses.map((course) => [course.name, course]))
  const storedByName = new Map(stored.map((course) => [course.name, course]))

  const alignedCourses = seedCourses.map((seedCourse) => {
    const existing = storedByName.get(seedCourse.name)
    if (!existing) return seedCourse

    return {
      ...seedCourse,
      ...existing,
      id: seedCourse.id,
      name: seedCourse.name,
      enrolledStudents: existing.enrolledStudents ?? 0,
    }
  })

  const extraCourses = stored
    .filter((course) => !seedByName.has(course.name))
    .map((course, index) => ({
      ...course,
      id: alignedCourses.length + index + 1,
    }))

  return [...alignedCourses, ...extraCourses]
}

export const useCourseStore = defineStore('courseStore', {
  state: () => ({
    courses: [] as Course[],
    loaded: false,
  }),

  getters: {
    courseNames: (state) => state.courses.map((course) => course.name),
  },

  actions: {
    // Init: localStorage/seed based courses load (force=true ने reload)
    init(force = false) {
      if (this.loaded && !force) return
      const stored = loadFromStorage()
      this.courses = normalizeCourses(stored)
      this.loaded = true
      saveToStorage(this.courses)
    },

    // Students बदलल्यावर course-wise enrolledStudents re-calc
    syncEnrollmentFromStudents(students: Student[]) {
      const counts = students.reduce<Record<string, number>>((acc, student) => {
        acc[student.course] = (acc[student.course] ?? 0) + 1
        return acc
      }, {})

      this.courses = this.courses.map((course) => ({
        ...course,
        enrolledStudents: counts[course.name] ?? 0,
      }))

      saveToStorage(this.courses)
    },

    // CRUD: create course
    addCourse(course: CourseFormData) {
      const maxId = this.courses.reduce((max, item) => Math.max(max, item.id), 0)

      const created: Course = {
        id: maxId + 1,
        name: course.name.trim(),
        code: course.code.trim().toUpperCase(),
        duration: course.duration,
        fees: Number(course.fees) || 0,
        status: course.status,
        description: course.description.trim(),
        startDate: course.startDate,
        endDate: course.endDate,
        maxStudents: Number(course.maxStudents) || 0,
        enrolledStudents: Number(course.enrolledStudents) || 0,
        batch: course.batch,
        trainer: course.trainer,
        assistantTrainer: course.assistantTrainer,
      }

      this.courses.push(created)
      saveToStorage(this.courses)
      return created
    },

    // CRUD: update course (enrolledStudents current ठेवतो)
    updateCourse(id: number, updated: CourseFormData) {
      const index = this.courses.findIndex((course) => course.id === id)
      if (index === -1) return null

      const current = this.courses[index]
      if (!current) return null

      const updatedCourse: Course = {
        id,
        name: updated.name.trim(),
        code: updated.code.trim().toUpperCase(),
        duration: updated.duration,
        fees: Number(updated.fees) || 0,
        status: updated.status,
        description: updated.description.trim(),
        startDate: updated.startDate,
        endDate: updated.endDate,
        maxStudents: Number(updated.maxStudents) || 0,
        enrolledStudents: current.enrolledStudents,
        batch: updated.batch,
        trainer: updated.trainer,
        assistantTrainer: updated.assistantTrainer,
      }

      this.courses[index] = updatedCourse
      saveToStorage(this.courses)
      return updatedCourse
    },

    // CRUD: delete single course
    deleteCourse(id: number) {
      const index = this.courses.findIndex((course) => course.id === id)
      if (index === -1) return false

      this.courses.splice(index, 1)
      saveToStorage(this.courses)
      return true
    },

    // CRUD: bulk delete (ids) + ids reindex
    deleteCourses(ids: number[]) {
      if (!ids.length) return []

      const idSet = new Set(ids)
      const removedCourses = this.courses.filter((course) => idSet.has(course.id))
      const remainingCourses = this.courses.filter((course) => !idSet.has(course.id))

      this.courses = remainingCourses.map((course, index) => ({
        ...course,
        id: index + 1,
      }))

      saveToStorage(this.courses)
      return removedCourses
    },

    // Undo/restore: export केलेले courses परत आणणे (name duplicates टाळतो)
    restoreCourses(coursesToRestore: Course[]) {
      if (!coursesToRestore.length) return false

      const existingByName = new Set(this.courses.map((course) => course.name))
      const validCourses = coursesToRestore.filter((course) => !existingByName.has(course.name))

      if (!validCourses.length) return false

      this.courses.push(...validCourses)
      this.courses = this.courses
        .sort((a, b) => a.id - b.id)
        .map((course, index) => ({ ...course, id: index + 1 }))

      saveToStorage(this.courses)
      return true
    },

    // Lookup helper: id ने course मिळवा
    getCourseById(id: number) {
      return this.courses.find((course) => course.id === id) ?? null
    },

    // Lookup helper: name ने course मिळवा
    getCourseByName(name: string) {
      return this.courses.find((course) => course.name === name) ?? null
    },

    // Reset: seed वर परत
    resetCourses() {
      this.courses = buildSeedCourses()
      this.loaded = true
      saveToStorage(this.courses)
    },
  },
})
