import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/server/config/env';
import { handleRoute } from '@/server/http/errors';
import { enforceRateLimit } from '@/server/http/rate-limit';
import { AppError } from '@/server/lib/errors';
import { buildGoogleAuthUrl } from '@/server/services/google';
import { createOAuthState, setOAuthStateCookie } from '@/server/session/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    await enforceRateLimit(request, 'auth', 20, 15 * 60 * 1000);

    let authUrl: string;
    try {
      authUrl = buildGoogleAuthUrl(createOAuthState());
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.redirect(`${getEnv().APP_ORIGIN}/dashboard?auth=unconfigured`);
      }
      throw error;
    }

    const state = new URL(authUrl).searchParams.get('state') ?? '';
    const response = NextResponse.redirect(authUrl);
    setOAuthStateCookie(response, state);
    return response;
  });
}
