import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import HealthStatus from './components/HealthStatus';


const App = () => (
  <Container maxWidth="md" sx={{ py: 8 }}>
    <Paper sx={{ p: 4 }}>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography component="h1" variant="h3">
            AsyncOps
          </Typography>

          <Typography color="text.secondary">
            Async engineering workspace for distributed teams.
          </Typography>
        </Stack>

        <HealthStatus />
      </Stack>
    </Paper>
  </Container>
);


export default App;