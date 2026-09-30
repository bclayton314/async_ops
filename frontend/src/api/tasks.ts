import type {
  CreateTaskRequest,
  Task,
  TaskPriority,
  TaskStatus,
} from '../types/task';


const taskUrl = (
  workspaceId: string,
  projectId: string,
): string => (
  `/api/workspaces/${workspaceId}`
  + `/projects/${projectId}`
  + '/tasks'
);


export const getTasks = async (
  token: string,
  workspaceId: string,
  projectId: string,
): Promise<Task[]> => {
  const response = await fetch(
    taskUrl(
      workspaceId,
      projectId,
    ),
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Unable to load tasks.');
  }

  return response.json() as Promise<Task[]>;
};


export const createTask = async (
  token: string,
  workspaceId: string,
  projectId: string,
  payload: CreateTaskRequest,
): Promise<Task> => {
  const response = await fetch(
    taskUrl(
      workspaceId,
      projectId,
    ),
    {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error('Unable to create task.');
  }

  return response.json() as Promise<Task>;
};


export const updateTask = async (
  token: string,
  workspaceId: string,
  projectId: string,
  taskId: string,
  payload: {
    title?: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
  },
): Promise<Task> => {
  const response = await fetch(
    `${taskUrl(workspaceId, projectId)}/${taskId}`,
    {
      method: 'PATCH',

      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error('Unable to update task.');
  }

  return response.json() as Promise<Task>;
};