import { clearTokens, getTokens, setTokens } from './token';

// ponytail: '/api' goes through the vite dev proxy (API has no CORS headers);
// point at 'https://api.everynaira.ng' directly once backend enables CORS
export const API_BASE_URL = '/api';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
  auth?: boolean;
  params?: Record<string, string | number | undefined>;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, params } = opts;

  const qs = params
    ? '?' +
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&')
    : '';
  const url = API_BASE_URL + path + qs;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const tokens = getTokens();
    if (tokens.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const call = () =>
    fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

  let res: Response;
  try {
    res = await call();
  } catch {
    throw new ApiError(0, 'No internet connection. Check your network.');
  }

  if (res.status === 401 && auth && (await tryRefresh())) {
    const tokens = getTokens();
    if (tokens.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;
    res = await call();
  }

  return handle(res);
}

async function handle<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: { status?: boolean; message?: string } | null = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  if (!res.ok) {
    throw new ApiError(res.status, json?.message || `Request failed (${res.status})`);
  }
  return (json ?? {}) as T;
}

let refreshing: Promise<boolean> | null = null;

const sessionExpiredHandlers = new Set<() => void>();

export function onSessionExpired(cb: () => void) {
  sessionExpiredHandlers.add(cb);
  return () => {
    sessionExpiredHandlers.delete(cb);
  };
}

async function tryRefresh(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      const tokens = getTokens();
      if (!tokens.refreshToken) return false;
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refreshToken`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: tokens.refreshToken }),
        });
        const json = await res.json();
        if (res.ok && json?.access_token) {
          setTokens(json.access_token, json.refresh_token || tokens.refreshToken!);
          return true;
        }
        clearTokens();
        sessionExpiredHandlers.forEach((cb) => cb());
        return false;
      } catch {
        return false;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}
