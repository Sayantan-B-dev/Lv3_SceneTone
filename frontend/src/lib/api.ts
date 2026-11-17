const trimBase = (value: string) => value.replace(/\/$/, '');

/** Auth, sessions, projects and health live on the app backend. */
export const APP_API_URL = trimBase(
  import.meta.env.VITE_APP_API_URL ?? import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
);

/** AI routes can be served by a separate app, such as the Cloudflare Worker. */
export const AI_API_URL = trimBase(import.meta.env.VITE_AI_API_URL ?? APP_API_URL);

interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return sendRequest<T>(APP_API_URL, path, init);
}

/** Sends AI calls to `VITE_AI_API_URL` when set, otherwise to the app backend. */
export async function aiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  return sendRequest<T>(AI_API_URL, path, init);
}

async function sendRequest<T>(baseUrl: string, path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | undefined;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = undefined;
    }

    throw new ApiError(
      response.status,
      payload?.error?.code ?? 'REQUEST_FAILED',
      payload?.error?.message ?? `Request failed with status ${response.status}.`,
      payload?.error?.details,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
