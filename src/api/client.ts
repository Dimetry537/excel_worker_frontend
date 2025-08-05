const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function api<T>(
  path: string,
  options: Omit<RequestInit, 'body'> & { body?: unknown } = {}
): Promise<T> {
  const { body, ...restOptions } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...restOptions,
    body: body && typeof body === 'object' ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API request failed: ${res.status} ${res.statusText} - ${errorText}`);
  }

  return res.json();
}
