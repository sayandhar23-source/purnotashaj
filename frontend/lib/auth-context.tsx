'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { api } from './api';

type UserT = { id: string; name: string; email: string; role: string } | null;

type AuthContextT = {
  user: UserT;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserT>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextT>({
  user: null,
  loading: true,
  login: async () => null,
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserT>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const token = Cookies.get('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/users/me');
      setUser({
        id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      });
    } catch {
      Cookies.remove('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    Cookies.set('token', res.data.token, { expires: 7 });
    setUser(res.data.user);
    return res.data.user as UserT;
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
