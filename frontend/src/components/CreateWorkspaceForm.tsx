import {
  useState,
  type FormEvent,
} from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { createWorkspace } from '../api/workspaces';
import { getAccessToken } from '../auth/tokenStorage';


interface CreateWorkspaceFormProps {
  onWorkspaceCreated: () => Promise<void>;
}


const CreateWorkspaceForm = ({
  onWorkspaceCreated,
}: CreateWorkspaceFormProps) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');
    setSubmitting(true);

    const token = getAccessToken();

    if (token === null) {
      setError('Authentication token is missing.');
      setSubmitting(false);
      return;
    }

    try {
      await createWorkspace(
        token,
        {
          name,
          slug,
        },
      );

      setName('');
      setSlug('');

      await onWorkspaceCreated();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create workspace.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={handleSubmit}
    >
      <Typography
        component="h3"
        variant="h6"
      >
        Create workspace
      </Typography>

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      <TextField
        label="Workspace name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
        }}
        required
        fullWidth
      />

      <TextField
        label="Workspace slug"
        value={slug}
        onChange={(event) => {
          setSlug(event.target.value);
        }}
        helperText="Lowercase letters, numbers, and hyphens only."
        required
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        disabled={submitting}
      >
        {submitting
          ? 'Creating...'
          : 'Create workspace'}
      </Button>
    </Stack>
  );
};


export default CreateWorkspaceForm;