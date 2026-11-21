import { NextRequest, NextResponse } from 'next/server';
import { handleRoute } from '@/server/http/errors';
import { enforceRateLimit } from '@/server/http/rate-limit';
import { findUserById, toPublicUser } from '@/server/services/users.service';
import {
  clearSessionCookie,
  destroySession,
  getSessionUserId,
} from '@/server/session/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    await enforceRateLimit(request, 'api', 300, 15 * 60 * 1000);
    const userId = await getSessionUserId(request);
    const user = userId ? await findUserById(userId) : null;

    if (!user) {
      await destroySession(request);
      const response = NextResponse.json(
        {
          error: {
            code: 'UNAUTHENTICATED',
            message: 'Authentication is required.',
          },
        },
        { status: 401 },
      );
      clearSessionCookie(response);
      return response;
    }

    return NextResponse.json({ user: toPublicUser(user) });
  });
}
