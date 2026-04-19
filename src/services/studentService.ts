/**
 * `services/studentService.ts` (Student Service - localStorage CRUD)
 *
 * - **Purpose**: Basic student CRUD backed by localStorage.
 * - **Role in project**: Data access layer if views/stores use this service pattern.
 * - **Logic type**: Read/write a student list in localStorage.
 * - **File type**: Service (frontend)
 *
 * Note: Uses localStorage today. With a backend/API:
 * - `getStudents` / `add` / `update` / `delete` become HTTP calls
 * - Pagination and search can move server-side
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
