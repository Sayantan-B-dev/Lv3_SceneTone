import { NextRequest, NextResponse } from 'next/server';
import { requireSessionUserId } from '@/server/http/auth';
import { handleRoute } from '@/server/http/errors';
import { assertSameOrigin } from '@/server/http/origin';
import { enforceRateLimit } from '@/server/http/rate-limit';
import { readJson } from '@/server/http/request';
import {
  blueprintRequestSchema,
  soundscapeBlueprintSchema,
  type SoundscapeBlueprint,
} from '@/server/schemas/ai.schema';
import { requestStructuredOutput } from '@/server/services/adaption.service';
import { buildBlueprintPrompt } from '@/server/services/ai-prompts';
import { saveBlueprint, toProjectDto, type ProjectDocument } from '@/server/services/projects.service';

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
    const input = await readJson(request, blueprintRequestSchema);

    const result = await requestStructuredOutput<SoundscapeBlueprint>({
      ...buildBlueprintPrompt(input),
      schema: soundscapeBlueprintSchema,
    });

    const project = input.projectId
      ? await saveBlueprint(userId, input.projectId, result.data)
      : null;

    return NextResponse.json({
      blueprint: result.data,
      model: result.model,
      provider: result.provider,
      project: savedProject(project),
      persisted: Boolean(project),
    });
  });
}
