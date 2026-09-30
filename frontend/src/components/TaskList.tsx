import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import {
  createTask,
  getTasks,
  updateTask,
} from '../api/tasks';

import { getAccessToken } from '../auth/tokenStorage';

import type { Project } from '../types/project';
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from '../types/task';
import type { Workspace } from '../types/workspace';


interface TaskListProps {
  workspace: Workspace;
  project: Project;
}


const TaskList = ({
  workspace,
  project,
}: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] =
    useState<TaskPriority>('medium');

  const [error, setError] = useState('');

  const canEdit =
    workspace.role === 'owner'
    || workspace.role === 'admin';


  const loadTasks = useCallback(
    async (): Promise<void> => {
      const token = getAccessToken();

      if (token === null) {
        setError('Authentication token is missing.');
        return;
      }

      try {
        setError('');

        const response = await getTasks(
          token,
          workspace.id,
          project.id,
        );

        setTasks(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load tasks.',
        );
      }
    },
    [
      workspace.id,
      project.id,
    ],
  );


  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const token = getAccessToken();

    if (token === null) {
      setError('Authentication token is missing.');
      return;
    }

    try {
      await createTask(
        token,
        workspace.id,
        project.id,
        {
          title,
          description: description || undefined,
          priority,
        },
      );

      setTitle('');
      setDescription('');
      setPriority('medium');

      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create task.',
      );
    }
  };


  const handleStatusChange = async (
    task: Task,
    status: TaskStatus,
  ) => {
    const token = getAccessToken();

    if (token === null) {
      setError('Authentication token is missing.');
      return;
    }

    try {
      await updateTask(
        token,
        workspace.id,
        project.id,
        task.id,
        {
          status,
        },
      );

      await loadTasks();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update task.',
      );
    }
  };


  return (
    <Stack spacing={3}>
      <Typography variant="h6">
        Tasks
      </Typography>

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      {canEdit && (
        <Stack
          component="form"
          spacing={2}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Task title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
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

          <TextField
            select
            label="Priority"
            value={priority}
            onChange={(event) => {
              setPriority(
                event.target.value as TaskPriority,
              );
            }}
          >
            <MenuItem value="low">
              Low
            </MenuItem>

            <MenuItem value="medium">
              Medium
            </MenuItem>

            <MenuItem value="high">
              High
            </MenuItem>
          </TextField>

          <Button
            type="submit"
            variant="contained"
            sx={{
              alignSelf: 'flex-start',
            }}
          >
            Create task
          </Button>
        </Stack>
      )}

      {tasks.length === 0 ? (
        <Typography color="text.secondary">
          No tasks yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {tasks.map((task) => (
            <Paper
              key={task.id}
              variant="outlined"
              sx={{
                p: 2,
              }}
            >
              <Stack spacing={1}>
                <Typography fontWeight={600}>
                  {task.title}
                </Typography>

                {task.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {task.description}
                  </Typography>
                )}

                <Typography variant="body2">
                  Priority: {task.priority}
                </Typography>

                {canEdit ? (
                  <TextField
                    select
                    size="small"
                    label="Status"
                    value={task.status}
                    onChange={(event) => {
                      void handleStatusChange(
                        task,
                        event.target.value as TaskStatus,
                      );
                    }}
                    sx={{
                      maxWidth: 180,
                    }}
                  >
                    <MenuItem value="todo">
                      Todo
                    </MenuItem>

                    <MenuItem value="in_progress">
                      In progress
                    </MenuItem>

                    <MenuItem value="blocked">
                      Blocked
                    </MenuItem>

                    <MenuItem value="done">
                      Done
                    </MenuItem>
                  </TextField>
                ) : (
                  <Typography variant="body2">
                    Status: {task.status}
                  </Typography>
                )}
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
};


export default TaskList;