import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  createProject,
  getProjects,
} from '../api/projects';

import { getAccessToken } from '../auth/tokenStorage';

import type { Project } from '../types/project';
import type { Workspace } from '../types/workspace';


interface ProjectListProps {
  workspace: Workspace;
}


const ProjectList = ({
  workspace,
}: ProjectListProps) => {
  const [projects, setProjects] = useState<Project[]>([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');

  const canCreate =
    workspace.role === 'owner'
    || workspace.role === 'admin';

  const loadProjects = useCallback(
    async () => {
      const token = getAccessToken();

      if (token === null) {
        return;
      }

      try {
        setError('');

        setProjects(
          await getProjects(
            token,
            workspace.id,
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load projects.',
        );
      }
    },
    [workspace.id],
  );

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const token = getAccessToken();

    if (token === null) {
      return;
    }

    try {
      await createProject(
        token,
        workspace.id,
        {
          name,
          description: description || undefined,
        },
      );

      setName('');
      setDescription('');

      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create project.',
      );
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">
        Projects
      </Typography>

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      {canCreate && (
        <Stack
          component="form"
          spacing={2}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Project name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            required
          />

          <TextField
            label="Description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
            multiline
            minRows={2}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              alignSelf: 'flex-start',
            }}
          >
            Create project
          </Button>
        </Stack>
      )}

      {projects.length === 0 ? (
        <Typography color="text.secondary">
          No projects yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {projects.map((project) => (
            <Paper
              key={project.id}
              variant="outlined"
              sx={{
                p: 2,
              }}
            >
              <Typography fontWeight={600}>
                {project.name}
              </Typography>

              {project.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {project.description}
                </Typography>
              )}
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
};


export default ProjectList;