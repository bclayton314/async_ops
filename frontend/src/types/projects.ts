export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}


export interface CreateProjectRequest {
  name: string;
  description?: string;
}