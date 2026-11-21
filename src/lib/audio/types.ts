import type { AudioMetrics } from '@/types';

export interface AudioAnalysisResult {
  metrics: AudioMetrics;
  warnings: string[];
  analyzedAt: string;
}

export interface AudioAnalysisOptions {
  fftSize?: number;
  windowSeconds?: number;
}
