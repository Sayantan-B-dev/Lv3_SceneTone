import { NextRequest, NextResponse } from 'next/server';
import { requireSessionUserId } from '@/server/http/auth';
import { handleRoute } from '@/server/http/errors';
import { assertSameOrigin } from '@/server/http/origin';
import { enforceRateLimit } from '@/server/http/rate-limit';
import { readJson, readParams } from '@/server/http/request';
import { projectIdParamsSchema, updateProjectSchema } from '@/server/schemas/project.schema';
import {
  deleteProject,
  getProject,
  toProjectDto,
  updateProject,
} from '@/server/services/projects.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

async function projectIdFrom(context: RouteContext): Promise<string> {
  const { projectId } = readParams(await context.params, projectIdParamsSchema);
  return projectId;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handleRoute(async () => {
    await enforceRateLimit(request, 'api', 300, 15 * 60 * 1000);
    const userId = await requireSessionUserId(request);
    const project = await getProject(userId, await projectIdFrom(context));
    return NextResponse.json({ project: toProjectDto(project) });
  });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    await enforceRateLimit(request, 'api', 300, 15 * 60 * 1000);
    const userId = await requireSessionUserId(request);
    const input = await readJson(request, updateProjectSchema);
    const project = await updateProject(userId, await projectIdFrom(context), input);
    return NextResponse.json({ project: toProjectDto(project) });
  });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    await enforceRateLimit(request, 'api', 300, 15 * 60 * 1000);
    const userId = await requireSessionUserId(request);
    await deleteProject(userId, await projectIdFrom(context));
    return new NextResponse(null, { status: 204 });
  });
}
