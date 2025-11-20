// src/context/AuthContext.tsx
import {
  useState,
  useEffect,
  ReactNode,
  memo,
} from 'react';
import { api, setTokens, clearTokens, loginApi } from '@/api/client';
import { toast } from 'sonner';
import { AuthContext, type UserRead, type AuthContextType } from '@/context/auth-types';

const AuthProviderBase = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserRead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const access = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');

      if (!access || !refresh) {
        setLoading(false);
        return;
      }

      setTokens(access, refresh);

      try {
        const me = await api<UserRead>('/auth/me');
        setUser(me);
      } catch {
        try {
          const newTokens = await api<{ access_token: string; refresh_token: string }>('/auth/refresh', {
            method: 'POST',
            body: { refresh_token: refresh },
            noAuth: true,
          });

          setTokens(newTokens.access_token, newTokens.refresh_token);
          localStorage.setItem('access_token', newTokens.access_token);
          localStorage.setItem('refresh_token', newTokens.refresh_token);

          const me = await api<UserRead>('/auth/me');
          setUser(me);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          clearTokens();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    toast.loading('Входим в систему...', { id: 'login' });

    try {
      const tokens = await loginApi(username, password);

      setTokens(tokens.access_token, tokens.refresh_token);
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);

      const me = await api<UserRead>('/auth/me');
      setUser(me);

      toast.success(`Добро пожаловать, ${me.username}!`, { id: 'login' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      toast.error(message || 'Неверный логин или пароль', { id: 'login' });
      throw err;
    }
  };

  const logout = () => {
    toast.success('Вы вышли из системы');
    clearTokens();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = memo(AuthProviderBase);
AuthProvider.displayName = 'AuthProvider';
