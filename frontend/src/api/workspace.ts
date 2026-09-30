export type WorkspaceRole =
  | 'owner'
  | 'admin'
  | 'member';


export interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  role: WorkspaceRole;
}