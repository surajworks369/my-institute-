/**
 * `stores/studentsStore.ts` (Students Store)
 *
 * - **Purpose**: Manage student data (list + CRUD) and dropdown options.
 * - **Role in project**: Feeds student pages (list/add/edit/view) and the dashboard.
 * - **Logic type**:
 *   - localStorage persistence (`STORAGE_KEY`)
 *   - Initial seed/demo dataset
 *   - Sync related stores (course/batch enrollment counts)
 * - **File type**: Store (frontend)
 *
 * Note: This module is not Pinia—it uses Vue `reactive`. Data lives in localStorage.
 * With a backend/API, load/save can become API calls with role/permission checks.
 */

import { reactive } from 'vue'
import type { Student, StudentFormData } from '@/types/student'
import {
  MASTER_CITY_LIST,
  MASTER_COURSE_NAMES,
  buildMasterBatchSeeds,
} from '@/stores/erpMasterData'
import { useCourseStore } from '@/stores/courseStore'
import { useBatchesStore } from '@/stores/batchesStore'

// localStorage key for student persistence
const STORAGE_KEY = 'vbh_students_v4'

// Master data (dropdown options) used when seeding
const cityList = [...MASTER_CITY_LIST]

const maleStudents = [
  'Suraj Kule',
  'Vaibhav Jadhav',
  'Vaibhav Aarekar',
  'Nikhil Ghanekar',
  'Aniket Kule',
  'Rajesh Ramane',
  'Pranay Ghade',
  'Milind Devdhar',
  'Gaurav Khedekar',
  'Aaditya Rohilkar',
  'Pankaj Ghade',
  'Prashant Kirve',
  'Prafull Telgade',
  'Sahil Jangali',
  'Omkar Pomendkar',
  'Sanket Burondkar',
  'Siddhesh Dhamane',
  'Shailesh Pimpale',
  'Suyash Bhosale',
  'Saurabh Bagakar',
  'Rutikesh Zagade',
  'Saurabh Ghanekar',
  'Marlesh Shinde',
  'Ajinkya Gurav',
  'Samir Pagade',
  'Siddhesh Durgavale',
  'Omkar Agre',
  'Abhay Dhatkar',
  'Vikrant Navrat',
  'Prathamesh Kavankar',
  'Aakash Surve',
  'Sudesh Kule',
  'Omkar Bhosale',
  'Sagar Kule',
  'Vishal Bait',
  'Aaditya Kule',
] as const

const femaleStudents = [
  'Suchita Ghanekar',
  'Pranali Solkar',
  'Shruti Ghanekar',
  'Jui Soman',
  'Varsha Gije',
  'Pratiksha Chavan',
] as const

const otherStudents = ['Anuj Chavan', 'Dhiraj Rumade', 'Ramprasad Bhosale'] as const

// Seed helpers: name → email/phone
function createEmail(name: string, id: number) {
  return `${name.toLowerCase().replace(/\s+/g, '.')}${id}@vastubhandar.edu`
}

function createPhone(id: number) {
  return `9${String(800000000 + id).padStart(9, '0')}`.slice(0, 10)
}

// Default batch name per course (for seed data)
function getSeedBatchNameByCourse(courseName: string) {
  const seed = buildMasterBatchSeeds().find((batch) => batch.courseName === courseName)
  return seed?.name ?? `${courseName} - Morning`
}

// Initial demo dataset used when no data exists yet
function createSeedStudents(): Student[] {
  const allStudents: Array<{ name: string; gender: 'Male' | 'Female' | 'Other' }> = [
    ...maleStudents.map((name) => ({ name, gender: 'Male' as const })),
    ...femaleStudents.map((name) => ({ name, gender: 'Female' as const })),
    ...otherStudents.map((name) => ({ name, gender: 'Other' as const })),
  ]

  return allStudents.map((item, index) => {
    const id = index + 1
    const course =
      MASTER_COURSE_NAMES[index % MASTER_COURSE_NAMES.length] ?? 'Full Stack Development'
    const batch = getSeedBatchNameByCourse(course)
    const city = cityList[index % cityList.length] ?? 'Kolhapur'
    const status = id % 4 === 0 || id % 7 === 0 ? 'Inactive' : 'Active'

    return {
      id,
      name: item.name,
      email: createEmail(item.name, id),
      phone: createPhone(id),
      course,
      batch,
      gender: item.gender,
      city,
      admissionDate: `2025-${String((index % 12) + 1).padStart(2, '0')}-${String((index % 28) + 1).padStart(2, '0')}`,
      status,
    }
  })
}

// localStorage → students load (fallback: seed)
function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSeedStudents()

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return createSeedStudents()
    }

    return parsed as Student[]
  } catch {
    return createSeedStudents()
  }
}

// students list persist
function saveStudents(students: Student[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
}

// Store state (reactive): students list
const state = reactive({
  students: loadStudents() as Student[],
})

export const useStudentStore = () => {
  // Related stores: keep enrollment counts in sync
  const courseStore = useCourseStore()
  const batchesStore = useBatchesStore()

  // Init: dependent stores init + derived counts sync
  const init = () => {
    courseStore.init()
    batchesStore.init()
    syncRelatedStores()
  }

  // Recalculate enrollment on courses/batches when the student list changes
  const syncRelatedStores = () => {
    courseStore.syncEnrollmentFromStudents(state.students)
    batchesStore.syncEnrollmentFromStudents(state.students)
  }

  // UI dropdown: course options (forms/filters)
  const getCourseOptions = () => {
    courseStore.init()
    return courseStore.courseNames
  }

  // UI dropdown: batch options after a course is selected
  const getBatchOptions = (courseName = '') => {
    batchesStore.init()
    courseStore.init()

    if (!courseName) {
      return batchesStore.batchNames
    }

    const linkedCourse = courseStore.getCourseByName(courseName)
    if (!linkedCourse) return []

    return batchesStore.batches
      .filter((batch) => batch.courseId === linkedCourse.id)
      .map((batch) => batch.name)
  }

  // CRUD: create student
  const addStudent = (student: StudentFormData) => {
    const maxId = state.students.reduce((max, item) => Math.max(max, item.id), 0)

    const newStudent: Student = {
      id: maxId + 1,
      ...student,
    }

    state.students.push(newStudent)
    saveStudents(state.students)
    syncRelatedStores()
    return newStudent
  }

  // CRUD: update student
  const updateStudent = (id: number, updatedData: StudentFormData) => {
    const index = state.students.findIndex((student) => student.id === id)
    if (index === -1) return null

    const updatedStudent: Student = {
      id,
      ...updatedData,
    }

    state.students[index] = updatedStudent
    saveStudents(state.students)
    syncRelatedStores()
    return updatedStudent
  }

  // CRUD: delete single student
  const deleteStudent = (id: number) => {
    const index = state.students.findIndex((student) => student.id === id)
    if (index === -1) return false

    state.students.splice(index, 1)
    saveStudents(state.students)
    syncRelatedStores()
    return true
  }

  // CRUD: bulk delete (ids list)
  const deleteStudents = (ids: number[]) => {
    if (!ids.length) return []

    const idSet = new Set(ids)
    const removedStudents = state.students.filter((student) => idSet.has(student.id))
    const remaining = state.students.filter((student) => !idSet.has(student.id))

    state.students.splice(0, state.students.length, ...remaining)
    saveStudents(state.students)
    syncRelatedStores()

    return removedStudents
  }

  // Undo/restore: restore deleted students (avoid id clashes)
  const restoreStudents = (studentsToRestore: Student[]) => {
    if (!studentsToRestore.length) return false

    const existingIds = new Set(state.students.map((student) => student.id))
    const validRestore = studentsToRestore.filter((student) => !existingIds.has(student.id))

    if (!validRestore.length) return false

    state.students.push(...validRestore)
    state.students.sort((a, b) => a.id - b.id)
    saveStudents(state.students)
    syncRelatedStores()
    return true
  }

  // Lookup helper: student by id
  const getStudentById = (id: number) => {
    return state.students.find((student) => student.id === id) ?? null
  }

  // Reset: restore demo seed data
  const resetStudents = () => {
    const seeded = createSeedStudents()
    state.students.splice(0, state.students.length, ...seeded)
    saveStudents(state.students)
    syncRelatedStores()
  }

  return {
    students: state.students,
    cityList,
    init,
    getCourseOptions,
    getBatchOptions,
    addStudent,
    updateStudent,
    deleteStudent,
    deleteStudents,
    restoreStudents,
    getStudentById,
    resetStudents,
  }
}
