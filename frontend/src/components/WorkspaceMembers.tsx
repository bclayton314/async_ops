import {
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

import { addWorkspaceMember } from '../api/workspaces';
import { getAccessToken } from '../auth/tokenStorage';

import type {
  Workspace,
  WorkspaceMember,
} from '../types/workspace';


interface WorkspaceMembersProps {
  workspace: Workspace;
  members: WorkspaceMember[];
  onMembersChanged: () => Promise<void>;
}


const WorkspaceMembers = ({
  workspace,
  members,
  onMembersChanged,
}: WorkspaceMembersProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] =
    useState<'admin' | 'member'>('member');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canManageMembers =
    workspace.role === 'owner'
    || workspace.role === 'admin';

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
    setSubmitting(true);

    try {
      await addWorkspaceMember(
        token,
        workspace.id,
        email,
        role,
      );

      setEmail('');
      setRole('member');

      await onMembersChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to add workspace member.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Typography
        component="h3"
        variant="h5"
      >
        Members
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
        }}
      >
        <Stack spacing={1}>
          {members.map((member) => (
            <Stack
              key={member.id}
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              justifyContent="space-between"
            >
              <Typography>
                {member.email}
              </Typography>

              <Typography color="text.secondary">
                {member.role}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      {canManageMembers && (
        <Stack
          component="form"
          spacing={2}
          onSubmit={handleSubmit}
        >
          <Typography variant="h6">
            Add member
          </Typography>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <TextField
            label="User email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            required
          />

          <TextField
            select
            label="Role"
            value={role}
            onChange={(event) => {
              setRole(
                event.target.value as 'admin' | 'member',
              );
            }}
          >
            <MenuItem value="member">
              Member
            </MenuItem>

            {workspace.role === 'owner' && (
              <MenuItem value="admin">
                Admin
              </MenuItem>
            )}
          </TextField>

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            sx={{
              alignSelf: 'flex-start',
            }}
          >
            {submitting
              ? 'Adding...'
              : 'Add member'}
          </Button>
        </Stack>
      )}
    </Stack>
  );
};


export default WorkspaceMembers;