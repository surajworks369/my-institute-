/**
 * `stores/batchesStore.ts` (Batches Store / Pinia)
 *
 * - **Purpose**: Manage batch data (list + CRUD) and derived stats (active/total/enrolled).
 * - **Role in project**: Provides batch reference data to batch pages, attendance, students, and the dashboard.
 * - **Logic type**:
 *   - localStorage persistence (`STORAGE_KEY`)
 *   - Seeded batches (master seeds + course linkage)
 *   - Normalize by merging seed + stored rows
 *   - Sync enrollment counts from the student list
 * - **File type**: Store (frontend / Pinia)
 *
 * Note: Batches live in the frontend/localStorage today. With a backend/API, CRUD can move server-side
 * and `courseId` validation can be enforced there.
 */

import { defineStore } from 'pinia'
import type { Batch, BatchCreateInput, BatchUpdateInput, BatchStatus } from '@/types/batch'
import type { Student } from '@/types/student'
import { buildMasterBatchSeeds } from '@/stores/erpMasterData'
import { useCourseStore } from '@/stores/courseStore'

// localStorage key for batch persistence
const STORAGE_KEY = 'vbh_erp_batches_v3'

// Timestamp helper (createdAt/updatedAt)
function nowISO(): string {
  return new Date().toISOString()
}

// localStorage → batches load
function loadFromStorage(): Batch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as Batch[]) : []
  } catch {
    return []
  }
}

// batches persist
function saveToStorage(batches: Batch[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(batches))
}

// Seed data: master batch seeds + resolve courseId via courseStore
function seedData(): Batch[] {
  const courseStore = useCourseStore()
  courseStore.init()

  const base = nowISO()

  return buildMasterBatchSeeds().map((seed, index): Batch => {
    const linkedCourse = courseStore.getCourseByName(seed.courseName)

    return {
      id: index + 1,
      name: seed.name,
      code: seed.code,
      courseId: linkedCourse?.id ?? 0,
      startDate: `2026-${String((index % 6) + 1).padStart(2, '0')}-01`,
      endDate: `2026-${String((index % 6) + 3).padStart(2, '0')}-28`,
      timing: seed.timing,
      days: seed.days,
      trainer: seed.trainer,
      assistantTrainer: seed.assistantTrainer,
      capacity: 30 + (index % 3) * 5,
      enrolled: 0,
      classroom: seed.classroom,
      status: seed.status,
      notes: 'Seeded ERP batch.',
      createdAt: base,
      updatedAt: base,
    }
  })
}

// Align stored batches with seeds (add missing seeds; keep extra stored rows)
function normalizeStoredBatches(stored: Batch[]): Batch[] {
  const seeded = seedData()
  if (!stored.length) return seeded

  const seededByName = new Map(seeded.map((batch) => [batch.name, batch]))
  const storedByName = new Map(stored.map((batch) => [batch.name, batch]))

  const aligned = seeded.map((seedBatch) => {
    const existing = storedByName.get(seedBatch.name)
    if (!existing) return seedBatch

    return {
      ...seedBatch,
      ...existing,
      id: seedBatch.id,
      name: seedBatch.name,
      code: seedBatch.code,
    }
  })

  const extras = stored
    .filter((batch) => !seededByName.has(batch.name))
    .map((batch, index) => ({
      ...batch,
      id: aligned.length + index + 1,
    }))

  return [...aligned, ...extras]
}

export const useBatchesStore = defineStore('batches', {
  state: () => ({
    batches: [] as Batch[],
    loaded: false,
  }),

  getters: {
    total: (s) => s.batches.length,
    activeCount: (s) => s.batches.filter((b) => b.status === 'Active').length,
    inactiveCount: (s) => s.batches.filter((b) => b.status === 'Inactive').length,
    totalCapacity: (s) => s.batches.reduce((sum, b) => sum + b.capacity, 0),
    totalEnrolled: (s) => s.batches.reduce((sum, b) => sum + b.enrolled, 0),
    getById: (s) => (id: number) => s.batches.find((b) => b.id === id) ?? null,
    batchNames: (s) => s.batches.map((b) => b.name),
  },

  actions: {
    // Init: load batches from localStorage/seed (`force` reloads)
    init(force = false): void {
      if (this.loaded && !force) return

      const stored = loadFromStorage()
      this.batches = normalizeStoredBatches(stored)
      this.loaded = true
      saveToStorage(this.batches)
    },

    // Recalculate per-batch enrollment when students change
    syncEnrollmentFromStudents(students: Student[]) {
      const counts = students.reduce<Record<string, number>>((acc, student) => {
        acc[student.batch] = (acc[student.batch] ?? 0) + 1
        return acc
      }, {})

      this.batches = this.batches.map((batch) => ({
        ...batch,
        enrolled: counts[batch.name] ?? 0,
        updatedAt: nowISO(),
      }))

      saveToStorage(this.batches)
    },

    // CRUD: create batch
    create(payload: BatchCreateInput): Batch {
      const maxId = this.batches.reduce((m, b) => Math.max(m, b.id), 0)

      const created: Batch = {
        ...payload,
        id: maxId + 1,
        createdAt: nowISO(),
        updatedAt: nowISO(),
        enrolled: Math.min(payload.enrolled, payload.capacity),
      }

      this.batches.unshift(created)
      saveToStorage(this.batches)
      return created
    },

    // CRUD: update batch (capacity/enrolled constraints ensure)
    update(id: number, patch: BatchUpdateInput): Batch | null {
      const index = this.batches.findIndex((b) => b.id === id)
      if (index === -1) return null

      const current = this.batches[index]
      if (!current) return null

      const updated: Batch = {
        id: current.id,
        name: patch.name ?? current.name,
        code: patch.code ?? current.code,
        courseId: patch.courseId ?? current.courseId,
        startDate: patch.startDate ?? current.startDate,
        endDate: patch.endDate ?? current.endDate,
        timing: patch.timing ?? current.timing,
        days: patch.days ?? current.days,
        trainer: patch.trainer ?? current.trainer,
        assistantTrainer: patch.assistantTrainer ?? current.assistantTrainer,
        capacity: patch.capacity ?? current.capacity,
        enrolled: patch.enrolled ?? current.enrolled,
        classroom: patch.classroom ?? current.classroom,
        status: patch.status ?? current.status,
        notes: patch.notes ?? current.notes,
        createdAt: current.createdAt,
        updatedAt: nowISO(),
      }

      if (updated.capacity <= 0) updated.capacity = 1
      if (updated.enrolled < 0) updated.enrolled = 0
      if (updated.enrolled > updated.capacity) updated.enrolled = updated.capacity

      this.batches[index] = updated
      saveToStorage(this.batches)
      return updated
    },

    // CRUD: delete batch
    remove(id: number): boolean {
      const before = this.batches.length
      this.batches = this.batches.filter((b) => b.id !== id)
      saveToStorage(this.batches)
      return this.batches.length !== before
    },

    // Status helper: active/inactive switch
    setStatus(id: number, status: BatchStatus): void {
      this.update(id, { status })
    },

    // Reset: restore demo seed data
    resetToSeed() {
      this.batches = seedData()
      this.loaded = true
      saveToStorage(this.batches)
    },
  },
})
