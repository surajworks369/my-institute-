/**
 * `services/studentService.ts` (Student Service - localStorage CRUD)
 *
 * - **कशासाठी**: Students ची basic CRUD operations localStorage वरून करणे.
 * - **Project मधली role**: जर UI/Store मध्ये service pattern वापरला तर data access layer म्हणून उपयोग.
 * - **Logic प्रकार**: localStorage list read/write (simple persistence).
 * - **File प्रकार**: service (frontend)
 *
 * Note: सध्या हा service localStorage वापरतो. पुढे backend/API आल्यावर:
 * - `getStudents/add/update/delete` → HTTP API calls होतील
 * - pagination/search server-side होऊ शकते
 */

import type { Student } from '../types/student'

// localStorage key: students persistence (service-level)
const STORAGE_KEY = 'erp_students'

export function getStudents(): Student[] {
  // Read: list load
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? (JSON.parse(data) as Student[]) : []
}

export function addStudent(student: Student): void {
  // Create: append + persist
  const students = getStudents()
  students.push(student)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
}

export function updateStudent(updated: Student): void {
  // Update: id match record replace + persist
  const students = getStudents().map((s) => (s.id === updated.id ? updated : s))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
}

export function deleteStudent(id: number): void {
  // Delete: id filter out + persist
  const students = getStudents().filter((s) => s.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students))
}
