import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import CssBaseline from '@mui/material/CssBaseline';

import App from './App';
import { AuthProvider } from './auth/AuthContext';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CssBaseline />

    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);