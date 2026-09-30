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

import {
  addWorkspaceMember,
  removeWorkspaceMember,
  updateWorkspaceMemberRole,
} from '../api/workspaces';

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


  const handleRoleChange = async (
    member: WorkspaceMember,
    newRole: 'admin' | 'member',
  ): Promise<void> => {
    const token = getAccessToken();

    if (token === null) {
      setError('Authentication token is missing.');
      return;
    }

    setError('');

    try {
      await updateWorkspaceMemberRole(
        token,
        workspace.id,
        member.user_id,
        newRole,
      );

      await onMembersChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update member.',
      );
    }
  };


  const handleRemove = async (
    member: WorkspaceMember,
  ): Promise<void> => {
    const token = getAccessToken();

    if (token === null) {
      setError('Authentication token is missing.');
      return;
    }

    setError('');

    try {
      await removeWorkspaceMember(
        token,
        workspace.id,
        member.user_id,
      );

      await onMembersChanged();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to remove member.',
      );
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

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
        }}
      >
        <Stack spacing={2}>
          {members.map((member) => {
            const isOwner = member.role === 'owner';

            const canEditMember =
              workspace.role === 'owner'
                ? !isOwner
                : workspace.role === 'admin'
                  ? member.role === 'member'
                  : false;

            return (
              <Stack
                key={member.id}
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{
                  xs: 'stretch',
                  sm: 'center',
                }}
              >
                <Stack spacing={0.25}>
                  <Typography>
                    {member.email}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {member.role}
                  </Typography>
                </Stack>

                {canEditMember && (
                  <Stack
                    direction="row"
                    spacing={1}
                  >
                    {workspace.role === 'owner' && (
                      <TextField
                        select
                        size="small"
                        value={member.role}
                        onChange={(event) => {
                          void handleRoleChange(
                            member,
                            event.target.value as
                              | 'admin'
                              | 'member',
                          );
                        }}
                        sx={{
                          minWidth: 120,
                        }}
                      >
                        <MenuItem value="member">
                          Member
                        </MenuItem>

                        <MenuItem value="admin">
                          Admin
                        </MenuItem>
                      </TextField>
                    )}

                    <Button
                      color="error"
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        void handleRemove(member);
                      }}
                    >
                      Remove
                    </Button>
                  </Stack>
                )}
              </Stack>
            );
          })}
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
                event.target.value as
                  | 'admin'
                  | 'member',
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