import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/server/config/env';
import { handleRoute } from '@/server/http/errors';
import { enforceRateLimit } from '@/server/http/rate-limit';
import { logger } from '@/server/lib/logger';
import { exchangeGoogleCode } from '@/server/services/google';
import { upsertGoogleUser } from '@/server/services/users.service';
import {
  clearOAuthStateCookie,
  createSession,
  destroySession,
  readOAuthStateCookie,
  setSessionCookie,
} from '@/server/session/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    await enforceRateLimit(request, 'auth', 20, 15 * 60 * 1000);

    const origin = getEnv().APP_ORIGIN;
    const { searchParams } = request.nextUrl;
    const code = searchParams.get('code') ?? undefined;
    const state = searchParams.get('state') ?? undefined;
    const error = searchParams.get('error') ?? undefined;
    const expectedState = readOAuthStateCookie(request);

    if (error || !code || !state || !expectedState || state !== expectedState) {
      const response = NextResponse.redirect(`${origin}/dashboard?auth=failed`);
      clearOAuthStateCookie(response);
      return response;
    }

    let identity;
    try {
      identity = await exchangeGoogleCode(code);
    } catch (exchangeError) {
      logger.warn({ err: exchangeError }, 'Google authorization code exchange failed');
      const response = NextResponse.redirect(`${origin}/dashboard?auth=failed`);
      clearOAuthStateCookie(response);
      return response;
    }

    const user = await upsertGoogleUser(identity);
    await destroySession(request);
    const sid = await createSession(user._id.toString());

    const response = NextResponse.redirect(`${origin}/dashboard?auth=success`);
    clearOAuthStateCookie(response);
    setSessionCookie(response, sid);
    return response;
  });
}
