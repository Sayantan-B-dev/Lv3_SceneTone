import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/api';
import type { AiResponse, MixReport, SoundscapeBlueprint } from '@/types';

export interface BlueprintRequest {
  sceneDescription: string;
  durationSeconds?: number;
  styleDirection?: string;
  platform?: string;
  constraints?: string;
  projectId?: string;
}

export interface MixReportRequest {
  objective: string;
  metrics: {
    channels: 1 | 2;
    durationSeconds: number;
    samplePeakDbfs: number | null;
    rmsDbfs: number | null;
    crestFactorDb: number | null;
    bandEnergy: { low: number; mid: number; high: number };
    stereoCorrelation: number | null;
  };
  projectId?: string;
  projectContext?: {
    name?: string;
    sceneBrief?: string;
  };
}

export function useGenerateBlueprint() {
  return useMutation({
    mutationFn: (input: BlueprintRequest) =>
      apiRequest<AiResponse<SoundscapeBlueprint> & { blueprint: SoundscapeBlueprint }>(
        '/ai/blueprint',
        { method: 'POST', body: JSON.stringify(input) },
      ),
  });
}

export function useGenerateMixReport() {
  return useMutation({
    mutationFn: (input: MixReportRequest) =>
      apiRequest<AiResponse<MixReport> & { report: MixReport }>('/ai/mix-report', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
  });
}
