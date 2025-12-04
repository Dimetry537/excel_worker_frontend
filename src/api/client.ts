export { ApiError }
const API_BASE = import.meta.env.VITE_API_URL;
if (!API_BASE) throw new Error("VITE_API_URL не задан в .env!");

class ApiError extends Error {
  status: number;
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = "ApiError";
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
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

export async function api<T = unknown>(
  path: string,
  options: Omit<RequestInit, "body"> & {
    body?: unknown;
    noAuth?: boolean;
    query?: Record<string, string | number | boolean | undefined>;
    responseType?: "json" | "blob" | "text";
  } = {}
): Promise<T> {
  const { body, noAuth = false, query, responseType = "json", ...restOptions } = options;

  let url = `${API_BASE}${path}`;

  if (query) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
    if (params.toString()) {
      url += (url.includes("?") ? "&" : "?") + params.toString();
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (!noAuth && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, {
    ...restOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !noAuth && refreshToken) {
    if (isRefreshing) {
      const newAccessToken = await new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
      headers["Authorization"] = `Bearer ${newAccessToken}`;
      res = await fetch(url, {
        ...restOptions,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } else {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!refreshRes.ok) throw new ApiError("Не удалось обновить токен", refreshRes.status);

        const { access_token, refresh_token } = await refreshRes.json();
        setTokens(access_token, refresh_token || refreshToken!);
        processQueue(null, access_token);

        headers["Authorization"] = `Bearer ${access_token}`;
        res = await fetch(url, {
          ...restOptions,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });
      } catch (err) {
        processQueue(err as Error);
        clearTokens();
        window.location.href = "/login";
        throw err;
      } finally {
        isRefreshing = false;
      }
    }
  }

  if (!res.ok) {
    let msg = "Ошибка сервера";
    let detail: string | undefined;

    try {
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data?.detail) {
          msg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
          detail = msg;
        }
      } catch {
        msg = text || msg;
      }
    } catch {
      msg = `Не удалось получить тело ответа (статус ${res.status})`;
    }

    throw new ApiError(msg, res.status, detail);
  }

  if (res.status === 204 || res.status === 205) {
    return null as T;
  }

  if (responseType === "blob") {
    return (await res.blob()) as T;
  }

  if (responseType === "text") {
    return (await res.text()) as T;
  }

  return res.json() as T;
}

export const loginApi = async (username: string, password: string) => {
  const formData = new FormData();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Ошибка авторизации");
  }

  return res.json();
};
