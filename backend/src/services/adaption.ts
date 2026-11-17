import { env } from '../config/env.js';
import { AppError, notImplemented } from '../lib/errors.js';
import type {
  BlueprintRequest,
  MixReport,
  MixReportRequest,
  SoundscapeBlueprint,
} from '../schemas/ai.schema.js';

export interface SoundscapeProvider {
  generateBlueprint(input: BlueprintRequest): Promise<SoundscapeBlueprint>;
  generateMixReport(input: MixReportRequest): Promise<MixReport>;
}

function requireProviderConfig(): void {
  if (!env.ADAPTION_API_KEY || !env.ADAPTION_BASE_URL || !env.ADAPTION_MODEL) {
    throw new AppError(503, 'AI_NOT_CONFIGURED', 'The AI provider is not configured.');
  }
}

class AdaptionProvider implements SoundscapeProvider {
  async generateBlueprint(_input: BlueprintRequest): Promise<SoundscapeBlueprint> {
    requireProviderConfig();
    throw notImplemented('Scene blueprint generation');
  }

  async generateMixReport(_input: MixReportRequest): Promise<MixReport> {
    requireProviderConfig();
    throw notImplemented('Mix report generation');
  }
}

export const adaptionProvider: SoundscapeProvider = new AdaptionProvider();
