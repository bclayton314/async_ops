import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  getWorkspace,
  getWorkspaceMembers,
} from '../api/workspaces';

import { getAccessToken } from '../auth/tokenStorage';

import type {
  Workspace,
  WorkspaceMember,
} from '../types/workspace';

import WorkspaceMembers from './WorkspaceMembers';
import ProjectList from './ProjectList';


interface WorkspaceDetailProps {
  workspaceId: string;
  onBack: () => void;
}


const WorkspaceDetail = ({
  workspaceId,
  onBack,
}: WorkspaceDetailProps) => {
  const [workspace, setWorkspace] =
    useState<Workspace | null>(null);

  const [members, setMembers] =
    useState<WorkspaceMember[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWorkspace = useCallback(
    async (): Promise<void> => {
      const token = getAccessToken();

      if (token === null) {
        setError('Authentication token is missing.');
        setLoading(false);
        return;
      }

      try {
        setError('');

        const [
          workspaceResponse,
          membersResponse,
        ] = await Promise.all([
          getWorkspace(
            token,
            workspaceId,
          ),
          getWorkspaceMembers(
            token,
            workspaceId,
          ),
        ]);

        setWorkspace(workspaceResponse);
        setMembers(membersResponse);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load workspace.',
        );
      } finally {
        setLoading(false);
      }
    },
    [workspaceId],
  );

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  if (loading) {
    return (
      <Stack alignItems="center">
        <CircularProgress aria-label="Loading workspace" />
      </Stack>
    );
  }

  if (error || workspace === null) {
    return (
      <Stack spacing={2}>
        <Alert severity="error">
          {error || 'Workspace not found.'}
        </Alert>

        <Button
          variant="outlined"
          onClick={onBack}
          sx={{
            alignSelf: 'flex-start',
          }}
        >
          Back to workspaces
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Button
        variant="text"
        onClick={onBack}
        sx={{
          alignSelf: 'flex-start',
        }}
      >
        ← Back to workspaces
      </Button>

      <Stack spacing={0.5}>
        <Typography
          component="h2"
          variant="h4"
        >
          {workspace.name}
        </Typography>

        <Typography color="text.secondary">
          {workspace.slug} · {workspace.role}
        </Typography>
      </Stack>

      <Divider />

      <WorkspaceMembers
        workspace={workspace}
        members={members}
        onMembersChanged={loadWorkspace}
      />

      <Divider />

      <ProjectList
        workspace={workspace}
      />
    </Stack>
  );
};


export default WorkspaceDetail;