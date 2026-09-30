export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'blocked'
  | 'done';


export type TaskPriority =
  | 'low'
  | 'medium'
  | 'high';


export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}


export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
}