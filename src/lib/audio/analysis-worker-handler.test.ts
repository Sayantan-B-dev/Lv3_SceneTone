import { describe, expect, it } from 'vitest';
import { handleAnalysisRequest, type AnalysisWorkerResponse } from './analysis-worker-handler';

function sine(frequency: number, samples = 4096, sampleRate = 44100): Float32Array {
  const data = new Float32Array(samples);
  for (let index = 0; index < samples; index += 1) {
    data[index] = 0.5 * Math.sin((2 * Math.PI * frequency * index) / sampleRate);
  }
  return data;
}

describe('analysis worker handler', () => {
  it('posts progress updates and explains the numbers it measured', () => {
    const responses: AnalysisWorkerResponse[] = [];

    handleAnalysisRequest(
      { channels: [sine(440)], sampleRate: 44100, duration: 4096 / 44100 },
      (message) => responses.push(message),
    );

    const progress = responses.filter((message) => message.type === 'progress');
    expect(progress.length).toBeGreaterThan(0);

    const result = responses.find((message) => message.type === 'result');
    expect(result?.type).toBe('result');
    if (result?.type === 'result') {
      expect(result.metrics.channels).toBe(1);
      expect(result.metrics.samplePeakDbfs).toBeCloseTo(-6.02, 1);
      expect(result.metrics.rmsDbfs).toBeCloseTo(-9.03, 1);
      expect(result.metrics.stereoCorrelation).toBeNull();
    }
  });
});
