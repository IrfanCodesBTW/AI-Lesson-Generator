import { useState, useEffect, ReactNode } from 'react';
import { User } from '../lib/api';
import { AuthContext, AuthState } from './auth-context';

const STORAGE_USER = 'user';
const STORAGE_TOKEN = 'token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(STORAGE_USER);
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_TOKEN));

  useEffect(() => {
    if (user && token) {
      localStorage.setItem(STORAGE_USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_TOKEN, token);
    }
  }, [user, token]);

  const setAuth = (nextUser: User, nextToken: string) => {
    setUser(nextUser);
    setToken(nextToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_USER);
    localStorage.removeItem(STORAGE_TOKEN);
  };

  const value: AuthState = { user, token, setAuth, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
