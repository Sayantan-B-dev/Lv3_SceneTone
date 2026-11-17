import type { RequestHandler } from 'express';
import { requireSessionUserId } from '../middleware/auth.js';
import type {
  BlueprintRequest,
  GuideRequest,
  MixReportRequest,
  SoundscapeBlueprint,
} from '../schemas/ai.schema.js';
import {
  mixReportSchema,
  soundscapeBlueprintSchema,
  type MixReport,
} from '../schemas/ai.schema.js';
import { requestStructuredOutput, requestText } from '../services/adaption.service.js';
import { buildBlueprintPrompt, buildGuidePrompt, buildMixReportPrompt } from '../services/ai-prompts.js';
import {
  saveBlueprint,
  saveMixReport,
  toProjectDto,
  type ProjectDocument,
} from '../services/projects.service.js';

function savedProject(project: ProjectDocument | null) {
  return project ? toProjectDto(project) : null;
}

export const generateBlueprint: RequestHandler = async (req, res) => {
  const input = req.body as BlueprintRequest;
  const result = await requestStructuredOutput<SoundscapeBlueprint>({
    ...buildBlueprintPrompt(input),
    schema: soundscapeBlueprintSchema,
  });

  const project = input.projectId
    ? await saveBlueprint(requireSessionUserId(req), input.projectId, result.data)
    : null;

  res.json({
    blueprint: result.data,
    model: result.model,
    provider: result.provider,
    project: savedProject(project),
    persisted: Boolean(project),
  });
};

export const generateMixReport: RequestHandler = async (req, res) => {
  const input = req.body as MixReportRequest;
  const result = await requestStructuredOutput<MixReport>({
    ...buildMixReportPrompt(input),
    schema: mixReportSchema,
    temperature: 0.4,
  });

  const project = input.projectId
    ? await saveMixReport(requireSessionUserId(req), input.projectId, result.data, input.metrics)
    : null;

  res.json({
    report: result.data,
    model: result.model,
    provider: result.provider,
    project: savedProject(project),
    persisted: Boolean(project),
  });
};

export const guideChat: RequestHandler = async (req, res) => {
  const input = req.body as GuideRequest;
  const result = await requestText({
    ...buildGuidePrompt(input),
    temperature: 0.75,
    maxTokens: 350,
  });

  res.json({
    answer: result.text,
    model: result.model,
    provider: result.provider,
  });
};
