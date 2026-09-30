import type {
  CreateProjectRequest,
  Project,
} from '../types/project';


export const getProjects = async (
  token: string,
  workspaceId: string,
): Promise<Project[]> => {
  const response = await fetch(
    `/api/workspaces/${workspaceId}/projects`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Unable to load projects.');
  }

  return response.json() as Promise<Project[]>;
};


export const createProject = async (
  token: string,
  workspaceId: string,
  payload: CreateProjectRequest,
): Promise<Project> => {
  const response = await fetch(
    `/api/workspaces/${workspaceId}/projects`,
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
    throw new Error('Unable to create project.');
  }

  return response.json() as Promise<Project>;
};