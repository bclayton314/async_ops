import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from '../api/auth';

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from './tokenStorage';

import type {
  LoginRequest,
  RegisterRequest,
  User,
} from '../types/auth';


interface AuthContextValue {
  user: User | null;
  loading: boolean;

  login: (
    credentials: LoginRequest,
  ) => Promise<void>;

  register: (
    credentials: RegisterRequest,
  ) => Promise<void>;

  logout: () => void;
}


const AuthContext = createContext<AuthContextValue | null>(
  null,
);


interface AuthProviderProps {
  children: ReactNode;
}


export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAccessToken();

      if (token === null) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(token);

        setUser(currentUser);
      } catch {
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const login = async (
    credentials: LoginRequest,
  ): Promise<void> => {
    const response = await loginRequest(credentials);

    setAccessToken(response.access_token);

    const currentUser = await getCurrentUser(
      response.access_token,
    );

    setUser(currentUser);
  };

  const logout = (): void => {
    clearAccessToken();
    setUser(null);
  };

  const register = async (
    credentials: RegisterRequest,
  ): Promise<void> => {
    await registerRequest(credentials);

    await login(credentials);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      'useAuth must be used within an AuthProvider.',
    );
  }

  return context;
};