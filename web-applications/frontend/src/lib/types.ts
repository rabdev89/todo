export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface Subtask {
  id: string
  taskId: string
  title: string
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  id: string
  taskId: string
  filename: string
  mimetype: string
  size: number
  url: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  priority: TaskPriority
  status: TaskStatus
  userId: string
  subtasks?: Subtask[]
  attachments?: Attachment[]
  createdAt: string
  updatedAt: string
}

