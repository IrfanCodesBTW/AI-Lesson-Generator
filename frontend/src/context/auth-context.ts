import { createContext } from 'react';
import { User } from '../lib/api';

export interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);
