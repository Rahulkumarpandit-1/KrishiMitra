import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../lib/types';
import { authApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (mobile: string, password: string) => Promise<void>;
  register: (data: import('../lib/types').RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token && token !== 'undefined' && token !== 'null') {
      authApi.me()
        .then((res) => {
          const u = res.data.user || res.data;
          if (u && u.id) {
            setUser(u);
          } else {
            throw new Error('No user returned');
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (mobile: string, password: string) => {
    const res = await authApi.login(mobile, password);
    const tokenStr = res.data.token || (res.data as any)?.data?.token;
    const userObj = res.data.user || (res.data as any)?.data?.user;
    if (tokenStr) {
      localStorage.setItem('token', tokenStr);
      setToken(tokenStr);
    }
    if (userObj) {
      setUser(userObj);
    }
  }, []);

  const register = useCallback(async (data: import('../lib/types').RegisterData) => {
    const res = await authApi.register(data);
    const tokenStr = res.data.token || (res.data as any)?.data?.token;
    const userObj = res.data.user || (res.data as any)?.data?.user;
    if (tokenStr) {
      localStorage.setItem('token', tokenStr);
      setToken(tokenStr);
    }
    if (userObj) {
      setUser(userObj);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((u: User) => setUser(u), []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
