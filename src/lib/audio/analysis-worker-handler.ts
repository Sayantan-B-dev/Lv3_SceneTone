import type { AudioMetrics } from '@/types';
import { computeMetricsFromChannels } from './analysis-core';

export interface AnalysisWorkerRequest {
  channels: Float32Array[];
  sampleRate: number;
  duration: number;
}

export type AnalysisWorkerResponse =
  | { type: 'progress'; fraction: number }
  | { type: 'result'; metrics: AudioMetrics }
  | { type: 'error'; message: string };

/** Pure handler shared by the worker and unit tests. */
export function handleAnalysisRequest(
  request: AnalysisWorkerRequest,
  post: (message: AnalysisWorkerResponse) => void,
): void {
  try {
    const metrics = computeMetricsFromChannels(
      request.channels,
      request.sampleRate,
      request.duration,
      (fraction) => post({ type: 'progress', fraction }),
    );
    post({ type: 'result', metrics });
  } catch (error) {
    post({
      type: 'error',
      message: error instanceof Error ? error.message : 'Audio analysis failed.',
    });
  }
}
