import type { NextRequest } from 'next/server';
import { AppError } from '../lib/errors';
import { getSessionUserId } from '../session/session';

export async function requireSessionUserId(request: NextRequest): Promise<string> {
  const userId = await getSessionUserId(request);
  if (!userId) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.');
  }
  return userId;
}
