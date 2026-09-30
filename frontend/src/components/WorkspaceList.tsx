import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { getWorkspaces } from '../api/workspaces';
import { getAccessToken } from '../auth/tokenStorage';

import type { Workspace } from '../types/workspace';

import CreateWorkspaceForm from './CreateWorkspaceForm';
import WorkspaceDetail from './WorkspaceDetail';


const WorkspaceList = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWorkspaces = useCallback(
    async (): Promise<void> => {
      const token = getAccessToken();

      if (token === null) {
        setError('Authentication token is missing.');
        setLoading(false);
        return;
      }

      try {
        setError('');

        const response = await getWorkspaces(token);

        setWorkspaces(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load workspaces.',
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadWorkspaces();
  }, [loadWorkspaces]);

  if (selectedWorkspaceId !== null) {
    return (
      <WorkspaceDetail
        workspaceId={selectedWorkspaceId}
        onBack={() => {
          setSelectedWorkspaceId(null);
        }}
      />
    );
  }

  return (
    <Stack spacing={4}>
      <CreateWorkspaceForm
        onWorkspaceCreated={loadWorkspaces}
      />

      <Stack spacing={2}>
        <Typography
          component="h2"
          variant="h5"
        >
          Your workspaces
        </Typography>

        {loading ? (
          <Stack alignItems="center">
            <CircularProgress aria-label="Loading workspaces" />
          </Stack>
        ) : error ? (
          <Alert severity="error">
            {error}
          </Alert>
        ) : workspaces.length === 0 ? (
          <Typography color="text.secondary">
            You do not belong to any workspaces yet.
          </Typography>
        ) : (
          <Paper variant="outlined">
            <List disablePadding>
              {workspaces.map((workspace) => (
                <ListItem
                  key={workspace.id}
                  divider
                  secondaryAction={
                    <Button
                      onClick={() => {
                        setSelectedWorkspaceId(workspace.id);
                      }}
                    >
                      Open
                    </Button>
                  }
                >
                  <ListItemText
                    primary={workspace.name}
                    secondary={`${workspace.slug} · ${workspace.role}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Stack>
    </Stack>
  );
};


export default WorkspaceList;