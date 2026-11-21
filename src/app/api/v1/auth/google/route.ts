import { NextRequest, NextResponse } from 'next/server';
import { handleRoute } from '@/server/http/errors';
import { assertSameOrigin } from '@/server/http/origin';
import { enforceRateLimit } from '@/server/http/rate-limit';
import { readJson } from '@/server/http/request';
import { AppError } from '@/server/lib/errors';
import { logger } from '@/server/lib/logger';
import { googleAuthSchema } from '@/server/schemas/auth.schema';
import { verifyGoogleIdToken } from '@/server/services/google';
import { toPublicUser, upsertGoogleUser } from '@/server/services/users.service';
import { createSession, destroySession, setSessionCookie } from '@/server/session/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    await enforceRateLimit(request, 'auth', 20, 15 * 60 * 1000);
    const { credential } = await readJson(request, googleAuthSchema);

    let identity;
    try {
      identity = await verifyGoogleIdToken(credential);
    } catch (error) {
      if (error instanceof AppError && error.statusCode < 500) {
        throw error;
      }

      logger.warn({ err: error }, 'Google credential verification failed');
      throw new AppError(401, 'INVALID_GOOGLE_TOKEN', 'Google credential could not be verified.');
    }

    const user = await upsertGoogleUser(identity);
    await destroySession(request);
    const sid = await createSession(user._id.toString());

    const response = NextResponse.json({ user: toPublicUser(user) });
    setSessionCookie(response, sid);
    return response;
  });
}
