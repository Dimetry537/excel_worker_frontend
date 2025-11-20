const API_BASE = import.meta.env.VITE_API_URL;
if (!API_BASE) throw new Error('VITE_API_URL не задан в .env!');

class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

let accessToken: string | null = null;
let refreshToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}> = [];

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
};

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

export async function api<T>(
  path: string,
  options: Omit<RequestInit, 'body'> & { body?: unknown; noAuth?: boolean } = {}
): Promise<T> {
  const { body, noAuth = false, ...restOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (!noAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE}${path}`, {
    ...restOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !noAuth && refreshToken) {
    if (isRefreshing) {
      const newAccessToken = await new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      res = await fetch(`${API_BASE}${path}`, {
        ...restOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } else {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshRes.ok) throw new ApiError('Не удалось обновить токен', refreshRes.status);

        const { access_token, refresh_token } = await refreshRes.json();
        setTokens(access_token, refresh_token || refreshToken!);
        processQueue(null, access_token);

        headers['Authorization'] = `Bearer ${access_token}`;
        res = await fetch(`${API_BASE}${path}`, {
          ...restOptions,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
      } catch (err) {
        processQueue(err as Error);
        clearTokens();
        window.location.href = '/login';
        throw err;
      } finally {
        isRefreshing = false;
      }
    }
  }

  if (!res.ok) {
    let msg = 'Ошибка сервера';
    let detail: string | undefined;

    try {
      const data = await res.json().catch(() => ({})); // если не JSON — вернёт {}

      if (data?.detail) {
        msg =
          typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        detail = msg;
      }
    } catch {
      try {
        msg = await res.text();
      } catch {
        msg = `Не удалось получить тело ответа (статус ${res.status})`;
      }
    }

    const error = new ApiError(msg, res.status, detail);
    throw error;
  }

  if (res.status === 204 || res.status === 205) {
    return null as T;
  }

  return res.json();
}

export const loginApi = async (username: string, password: string) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Ошибка авторизации');
  }

  return res.json(); // → { access_token, refresh_token }
};
