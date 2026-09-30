import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useAuth } from './auth/AuthContext';
import HealthStatus from './components/HealthStatus';
import LoginForm from './components/LoginForm';
import UserPanel from './components/UserPanel';


const App = () => {
  const {
    user,
    loading,
  } = useAuth();

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 8,
      }}
    >
      <Paper
        sx={{
          p: 4,
        }}
      >
        <Stack spacing={4}>
          <Stack spacing={1}>
            <Typography
              component="h1"
              variant="h3"
            >
              AsyncOps
            </Typography>

            <Typography color="text.secondary">
              Async engineering workspace for distributed teams.
            </Typography>
          </Stack>

          <HealthStatus />

          {loading ? (
            <Stack alignItems="center">
              <CircularProgress
                aria-label="Loading session"
              />
            </Stack>
          ) : user === null ? (
            <LoginForm />
          ) : (
            <UserPanel />
          )}
        </Stack>
      </Paper>
    </Container>
  );
};


export default App;