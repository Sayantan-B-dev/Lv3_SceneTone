import { getEnv } from '../config/env';
import { AppError } from '../lib/errors';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function assertSameOrigin(request: Request): void {
  if (SAFE_METHODS.has(request.method.toUpperCase())) {
    return;
  }

  const origin = request.headers.get('origin');
  if (!origin) {
    return;
  }

  const normalized = origin.replace(/\/$/u, '');
  const isDevelopment = process.env.NODE_ENV !== 'production';
  if (isDevelopment && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(normalized)) {
    return;
  }

  const allowed = getEnv().APP_ORIGIN.replace(/\/$/u, '');
  if (normalized !== allowed) {
    throw new AppError(403, 'CSRF_ORIGIN_REJECTED', 'Request origin is not allowed.');
  }
}
