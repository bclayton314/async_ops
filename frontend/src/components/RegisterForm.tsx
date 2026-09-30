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


const RegisterForm = () => {
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        email,
        password,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to register.',
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
        Create account
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
        helperText="Use at least 8 characters."
      />

      <TextField
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(event) => {
          setConfirmPassword(event.target.value);
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
          ? 'Creating account...'
          : 'Create account'}
      </Button>
    </Stack>
  );
};


export default RegisterForm;