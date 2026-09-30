import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useAuth } from '../auth/AuthContext';


const UserPanel = () => {
  const {
    user,
    logout,
  } = useAuth();

  if (user === null) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">
        Welcome to AsyncOps
      </Typography>

      <Typography color="text.secondary">
        Signed in as {user.email}
      </Typography>

      <Button
        variant="outlined"
        onClick={logout}
        sx={{
          alignSelf: 'flex-start',
        }}
      >
        Sign out
      </Button>
    </Stack>
  );
};


export default UserPanel;