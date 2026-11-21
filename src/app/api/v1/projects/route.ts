import { NextRequest, NextResponse } from 'next/server';
import { requireSessionUserId } from '@/server/http/auth';
import { handleRoute } from '@/server/http/errors';
import { assertSameOrigin } from '@/server/http/origin';
import { enforceRateLimit } from '@/server/http/rate-limit';
import { readJson } from '@/server/http/request';
import { createProjectSchema } from '@/server/schemas/project.schema';
import { createProject, listProjects, toProjectDto } from '@/server/services/projects.service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    await enforceRateLimit(request, 'api', 300, 15 * 60 * 1000);
    const userId = await requireSessionUserId(request);
    const projects = await listProjects(userId);
    return NextResponse.json({ projects: projects.map(toProjectDto) });
  });
}

export async function POST(request: NextRequest) {
  return handleRoute(async () => {
    assertSameOrigin(request);
    await enforceRateLimit(request, 'api', 300, 15 * 60 * 1000);
    const userId = await requireSessionUserId(request);
    const input = await readJson(request, createProjectSchema);
    const project = await createProject(userId, input);
    return NextResponse.json({ project: toProjectDto(project) }, { status: 201 });
  });
}
