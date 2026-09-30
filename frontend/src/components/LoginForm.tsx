import {
  useState,
  type FormEvent,
} from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAuth } from '../auth/AuthContext';


const LoginForm = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');
    setSubmitting(true);

    try {
      await login({
        email,
        password,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to log in.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack
      component="form"
      spacing={3}
      onSubmit={handleSubmit}
    >
      <Typography
        component="h2"
        variant="h5"
      >
        Sign in
      </Typography>

      {error && (
        <Alert severity="error">
          {error}
        </Alert>
      )}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
        }}
        required
        fullWidth
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
        }}
        required
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        disabled={submitting}
      >
        {submitting
          ? 'Signing in...'
          : 'Sign in'}
      </Button>
    </Stack>
  );
};


export default LoginForm;