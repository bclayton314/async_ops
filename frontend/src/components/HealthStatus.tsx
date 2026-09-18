import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { getHealth } from '../api/health';
import type { HealthResponse } from '../types/health';


const HealthStatus = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const response = await getHealth();
        setHealth(response);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to connect to AsyncOps API.',
        );
      } finally {
        setLoading(false);
      }
    };

    void loadHealth();
  }, []);

  if (loading) {
    return (
      <Stack sx={{ alignItems: 'center' }}>
        <CircularProgress aria-label="Checking system status" />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Alert severity="success">
      <Typography sx={{ fontWeight: 600 }}>
        AsyncOps is online
      </Typography>

      <Typography variant="body2">
        API: {health?.status}
      </Typography>

      <Typography variant="body2">
        Database: {health?.database}
      </Typography>
    </Alert>
  );
};


export default HealthStatus;