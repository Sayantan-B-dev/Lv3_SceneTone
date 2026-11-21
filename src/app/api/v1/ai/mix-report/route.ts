import { NextRequest, NextResponse } from 'next/server';
import { requireSessionUserId } from '@/server/http/auth';
import { handleRoute } from '@/server/http/errors';
import { assertSameOrigin } from '@/server/http/origin';
import { enforceRateLimit } from '@/server/http/rate-limit';
import { readJson } from '@/server/http/request';
import { mixReportRequestSchema, mixReportSchema, type MixReport } from '@/server/schemas/ai.schema';
import { requestStructuredOutput } from '@/server/services/adaption.service';
import { buildMixReportPrompt } from '@/server/services/ai-prompts';
import { saveMixReport, toProjectDto, type ProjectDocument } from '@/server/services/projects.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function savedProject(project: ProjectDocument | null) {
  return project ? toProjectDto(project) : null;
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    const userId = await requireSessionUserId(request);
    await enforceRateLimit(request, 'ai', 60, 60 * 60 * 1000);
    const input = await readJson(request, mixReportRequestSchema);

    const result = await requestStructuredOutput<MixReport>({
      ...buildMixReportPrompt(input),
      schema: mixReportSchema,
      temperature: 0.4,
    });

    const project = input.projectId
      ? await saveMixReport(userId, input.projectId, result.data, input.metrics)
      : null;

    return NextResponse.json({
      report: result.data,
      model: result.model,
      provider: result.provider,
      project: savedProject(project),
      persisted: Boolean(project),
    });
  });
}
