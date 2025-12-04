import { useState, useEffect, ReactNode, memo, useCallback } from 'react';
import { api, setTokens, clearTokens, loginApi } from '@/api/client';
import { initializeSession } from '@/hooks/usePersistedFilters';
import { toast } from 'sonner';
import { FILTERS_KEY, SESSION_KEY } from '@/constants/storageKeys';
import { AuthContext, type UserRead } from '@/context/auth-types';

const persistTokens = (access: string, refresh: string) => {
  setTokens(access, refresh);
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

const clearStoredTokens = () => {
  clearTokens();
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

const AuthProviderBase = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserRead | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const me = await api<UserRead>('/auth/me');
    setUser(me);
  }, []);

  const tryRefresh = useCallback(async (refresh: string) => {
    const newTokens = await api<{ access_token: string; refresh_token: string }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: { refresh_token: refresh },
        noAuth: true,
      }
    );

    persistTokens(newTokens.access_token, newTokens.refresh_token);
    await fetchMe();
  }, [fetchMe]);

  const initAuth = useCallback(async () => {
    const access = localStorage.getItem('access_token');
    const refresh = localStorage.getItem('refresh_token');

    if (!access || !refresh) {
      setLoading(false);
      return;
    }

    setTokens(access, refresh);

    try {
      await fetchMe();
    } catch {
      try {
        await tryRefresh(refresh);
      } catch {
        clearStoredTokens();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchMe, tryRefresh]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = useCallback(async (username: string, password: string) => {
    toast.loading('Входим в систему...', { id: 'login' });

    try {
      const tokens = await loginApi(username, password);

      persistTokens(tokens.access_token, tokens.refresh_token);
      initializeSession();

      await fetchMe();

      toast.success(`Добро пожаловать!`, { id: 'login' });
    } catch (err: unknown) {
      const message = 
        err instanceof Error ? err.message : 'Ошибка входа';

      toast.error(message, { id: 'login' });
      throw err;
    }
  }, [fetchMe]);

  const logout = useCallback(() => {
    toast.success('Вы вышли из системы');
    clearStoredTokens();
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(FILTERS_KEY)
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = memo(AuthProviderBase);
AuthProvider.displayName = 'AuthProvider';
