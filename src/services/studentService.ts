import type { Student } from '../types/student'

const STORAGE_KEY = 'erp_students'

export function getStudents(): Student[] {
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function addStudent(student: Student) {
  const students = getStudents()
  students.push(student)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
}

export function updateStudent(updated: Student) {
  const students = getStudents().map((s) => (s.id === updated.id ? updated : s))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
}

export function deleteStudent(id: string) {
  const students = getStudents().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
}
