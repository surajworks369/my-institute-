export type BatchStatus = 'Active' | 'Inactive'

export interface Batch {
  id: number
  name: string
  code: string
  courseId: number
  startDate: string
  endDate: string
  timing: string
  days: string[]
  trainer: string
  assistantTrainer: string
  capacity: number
  enrolled: number
  classroom: string
  status: BatchStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export type BatchCreateInput = Omit<Batch, 'id' | 'createdAt' | 'updatedAt'>

export type BatchUpdateInput = Partial<Omit<Batch, 'id' | 'createdAt'>> & {
  updatedAt?: string
}
