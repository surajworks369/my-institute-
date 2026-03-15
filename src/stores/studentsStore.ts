import { reactive } from 'vue'
import type { Student, StudentFormData } from '@/types/student'
import {
  MASTER_CITY_LIST,
  MASTER_COURSE_NAMES,
  buildMasterBatchSeeds,
} from '@/stores/erpMasterData'
import { useCourseStore } from '@/stores/courseStore'
import { useBatchesStore } from '@/stores/batchesStore'

const STORAGE_KEY = 'vbh_students_v4'

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

function createEmail(name: string, id: number) {
  return `${name.toLowerCase().replace(/\s+/g, '.')}${id}@vastubhandar.edu`
}

function createPhone(id: number) {
  return `9${String(800000000 + id).padStart(9, '0')}`.slice(0, 10)
}

function getSeedBatchNameByCourse(courseName: string) {
  const seed = buildMasterBatchSeeds().find((batch) => batch.courseName === courseName)
  return seed?.name ?? `${courseName} - Morning`
}

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

function saveStudents(students: Student[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
}

const state = reactive({
  students: loadStudents() as Student[],
})

export const useStudentStore = () => {
  const courseStore = useCourseStore()
  const batchesStore = useBatchesStore()

  const init = () => {
    courseStore.init()
    batchesStore.init()
    syncRelatedStores()
  }

  const syncRelatedStores = () => {
    courseStore.syncEnrollmentFromStudents(state.students)
    batchesStore.syncEnrollmentFromStudents(state.students)
  }

  const getCourseOptions = () => {
    courseStore.init()
    return courseStore.courseNames
  }

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

  const deleteStudent = (id: number) => {
    const index = state.students.findIndex((student) => student.id === id)
    if (index === -1) return false

    state.students.splice(index, 1)
    saveStudents(state.students)
    syncRelatedStores()
    return true
  }

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

  const getStudentById = (id: number) => {
    return state.students.find((student) => student.id === id) ?? null
  }

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
