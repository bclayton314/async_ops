import type { Workspace } from '../types/workspace';


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