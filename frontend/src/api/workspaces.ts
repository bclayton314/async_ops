import type {
  Workspace,
  WorkspaceMember,
} from '../types/workspace';


export interface CreateWorkspaceRequest {
  name: string;
  slug: string;
}


export const getWorkspaces = async (
  token: string,
): Promise<Workspace[]> => {
  const response = await fetch(
    '/api/workspaces',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Unable to load workspaces.');
  }

  return response.json() as Promise<Workspace[]>;
};


export const createWorkspace = async (
  token: string,
  payload: CreateWorkspaceRequest,
): Promise<Workspace> => {
  const response = await fetch(
    '/api/workspaces',
    {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(payload),
    },
  );

  if (response.status === 409) {
    throw new Error(
      'A workspace with this slug already exists.',
    );
  }

  if (!response.ok) {
    throw new Error('Unable to create workspace.');
  }

  return response.json() as Promise<Workspace>;
};

export const getWorkspace = async (
  token: string,
  workspaceId: string,
): Promise<Workspace> => {
  const response = await fetch(
    `/api/workspaces/${workspaceId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Unable to load workspace.');
  }

  return response.json() as Promise<Workspace>;
};


export const getWorkspaceMembers = async (
  token: string,
  workspaceId: string,
): Promise<WorkspaceMember[]> => {
  const response = await fetch(
    `/api/workspaces/${workspaceId}/members`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error('Unable to load workspace members.');
  }

  return response.json() as Promise<WorkspaceMember[]>;
};


export const addWorkspaceMember = async (
  token: string,
  workspaceId: string,
  email: string,
  role: 'admin' | 'member',
): Promise<WorkspaceMember> => {
  const response = await fetch(
    `/api/workspaces/${workspaceId}/members`,
    {
      method: 'POST',

      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email,
        role,
      }),
    },
  );

  if (response.status === 404) {
    throw new Error('User not found.');
  }

  if (response.status === 409) {
    throw new Error(
      'User is already a workspace member.',
    );
  }

  if (response.status === 403) {
    throw new Error(
      'You do not have permission to add this member.',
    );
  }

  if (!response.ok) {
    throw new Error('Unable to add workspace member.');
  }

  return response.json() as Promise<WorkspaceMember>;
};
