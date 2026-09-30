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

import TaskList from './TaskList';


interface ProjectListProps {
  workspace: Workspace;
}


const ProjectList = ({
  workspace,
}: ProjectListProps) => {
  const [projects, setProjects] = useState<Project[]>([]);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');

  const canCreate =
    workspace.role === 'owner'
    || workspace.role === 'admin';


  const loadProjects = useCallback(
    async (): Promise<void> => {
      const token = getAccessToken();

      if (token === null) {
        setError('Authentication token is missing.');
        return;
      }

      try {
        setError('');

        const response = await getProjects(
          token,
          workspace.id,
        );

        setProjects(response);
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
      setError('Authentication token is missing.');
      return;
    }

    setError('');

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


  if (selectedProject !== null) {
    return (
      <Stack spacing={3}>
        <Button
          variant="text"
          onClick={() => {
            setSelectedProject(null);
          }}
          sx={{
            alignSelf: 'flex-start',
          }}
        >
          ← Back to projects
        </Button>

        <Stack spacing={0.5}>
          <Typography variant="h5">
            {selectedProject.name}
          </Typography>

          {selectedProject.description && (
            <Typography color="text.secondary">
              {selectedProject.description}
            </Typography>
          )}
        </Stack>

        <TaskList
          workspace={workspace}
          project={selectedProject}
        />
      </Stack>
    );
  }


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
              <Stack spacing={1}>
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

                <Button
                  variant="text"
                  onClick={() => {
                    setSelectedProject(project);
                  }}
                  sx={{
                    alignSelf: 'flex-start',
                  }}
                >
                  Open
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
};


export default ProjectList;