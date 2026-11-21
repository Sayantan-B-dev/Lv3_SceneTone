import { NextRequest, NextResponse } from 'next/server';
import { handleRoute } from '@/server/http/errors';
import { assertSameOrigin } from '@/server/http/origin';
import { enforceRateLimit } from '@/server/http/rate-limit';
import { clearSessionCookie, destroySession } from '@/server/session/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    await enforceRateLimit(request, 'api', 300, 15 * 60 * 1000);
    await destroySession(request);

    const response = new NextResponse(null, { status: 204 });
    clearSessionCookie(response);
    return response;
  });
}
