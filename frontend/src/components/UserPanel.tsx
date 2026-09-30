import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useAuth } from '../auth/AuthContext';

import WorkspaceList from './WorkspaceList';


const UserPanel = () => {
  const {
    user,
    logout,
  } = useAuth();

  if (user === null) {
    return null;
  }

  return (
    <Stack spacing={4}>
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{
          xs: 'flex-start',
          sm: 'center',
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5">
            Dashboard
          </Typography>

          <Typography color="text.secondary">
            Signed in as {user.email}
          </Typography>
        </Stack>

        <Button
          variant="outlined"
          onClick={logout}
        >
          Sign out
        </Button>
      </Stack>

      <Divider />

      <WorkspaceList />
    </Stack>
  );
};


export default UserPanel;