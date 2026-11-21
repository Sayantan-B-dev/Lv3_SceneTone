import { NextRequest, NextResponse } from 'next/server';
import { handleRoute } from '@/server/http/errors';
import { assertSameOrigin } from '@/server/http/origin';
import { enforceRateLimit } from '@/server/http/rate-limit';
import { readJson } from '@/server/http/request';
import { guideRequestSchema } from '@/server/schemas/ai.schema';
import { requestText } from '@/server/services/adaption.service';
import { buildGuidePrompt } from '@/server/services/ai-prompts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    await enforceRateLimit(request, 'guide', 40, 60 * 60 * 1000);
    const input = await readJson(request, guideRequestSchema);

    const result = await requestText({
      ...buildGuidePrompt(input),
      temperature: 0.75,
      maxTokens: 350,
    });

    return NextResponse.json({
      answer: result.text,
      model: result.model,
      provider: result.provider,
    });
  });
}
