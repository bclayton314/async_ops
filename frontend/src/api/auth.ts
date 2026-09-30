import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from '../types/auth';


export const register = async (
  payload: RegisterRequest,
): Promise<User> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Unable to register user.');
  }

  return response.json() as Promise<User>;
};


export const login = async (
  payload: LoginRequest,
): Promise<TokenResponse> => {
  const form = new URLSearchParams();

  form.set('username', payload.email);
  form.set('password', payload.password);

  const response = await fetch('/api/auth/login', {
    method: 'POST',

    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },

    body: form,
  });

  if (!response.ok) {
    throw new Error('Incorrect email or password.');
  }

  return response.json() as Promise<TokenResponse>;
};


export const getCurrentUser = async (
  token: string,
): Promise<User> => {
  const response = await fetch('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Unable to load current user.');
  }

  return response.json() as Promise<User>;
};