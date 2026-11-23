import type { AudioMetrics } from '@/types';
import { computeMetricsFromChannels, type ProgressCallback } from './audio/analysis-core';
import type {
  AnalysisWorkerRequest,
  AnalysisWorkerResponse,
} from './audio/analysis-worker-handler';

export { computeBandEnergy, computeMetrics } from './audio/analysis-core';
export type { AudioBufferLike } from './audio/analysis-core';

export interface AudioAnalysis extends AudioMetrics {
  fileName: string;
  sizeBytes: number;
}

export interface AnalyzeOptions {
  signal?: AbortSignal;
  onProgress?: ProgressCallback;
}

function abortError(): DOMException {
  return new DOMException('Audio analysis cancelled.', 'AbortError');
}

function runOnMainThread(
  channels: Float32Array[],
  sampleRate: number,
  duration: number,
  options: AnalyzeOptions,
): Promise<AudioMetrics> {
  return Promise.resolve().then(() =>
    computeMetricsFromChannels(channels, sampleRate, duration, options.onProgress),
  );
}

function runInWorker(
  channels: Float32Array[],
  sampleRate: number,
  duration: number,
  options: AnalyzeOptions,
): Promise<AudioMetrics> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./audio/analysis.worker.ts', import.meta.url), {
      type: 'module',
    });

    const cleanup = () => {
      options.signal?.removeEventListener('abort', onAbort);
      worker.terminate();
    };

    function onAbort() {
      cleanup();
      reject(abortError());
    }

    if (options.signal?.aborted) {
      onAbort();
      return;
    }
    options.signal?.addEventListener('abort', onAbort);

    worker.onmessage = (event: MessageEvent<AnalysisWorkerResponse>) => {
      const message = event.data;

      if (message.type === 'progress') {
        options.onProgress?.(message.fraction);
        return;
      }

      cleanup();

      if (message.type === 'result') {
        resolve(message.metrics);
      } else {
        reject(new Error(message.message));
      }
    };

    worker.onerror = (event) => {
      cleanup();
      reject(new Error(event.message || 'Audio analysis worker failed.'));
    };

    const workerChannels = channels.map((channel) => channel.slice());
    const request: AnalysisWorkerRequest = { channels: workerChannels, sampleRate, duration };
    const transfer = workerChannels.map((channel) => channel.buffer as ArrayBuffer);
    worker.postMessage(request, transfer);
  });
}

async function computeAnalysisMetrics(
  channels: Float32Array[],
  sampleRate: number,
  duration: number,
  options: AnalyzeOptions,
): Promise<AudioMetrics> {
  if (typeof Worker === 'undefined') {
    return runOnMainThread(channels, sampleRate, duration, options);
  }

  try {
    return await runInWorker(channels, sampleRate, duration, options);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }

    return runOnMainThread(channels, sampleRate, duration, options);
  }
}

export async function analyzeAudioFile(
  file: File,
  options: AnalyzeOptions = {},
): Promise<AudioAnalysis> {
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error('This browser does not support the Web Audio API.');
  }

  const context = new AudioContextClass();
  try {
    const bytes = await file.arrayBuffer();
    const buffer = await context.decodeAudioData(bytes);

    if (options.signal?.aborted) {
      throw abortError();
    }

    const channels = Array.from(
      { length: Math.min(2, buffer.numberOfChannels) },
      (_, channel) => buffer.getChannelData(channel).slice(),
    );

    const metrics = await computeAnalysisMetrics(
      channels,
      buffer.sampleRate,
      buffer.duration,
      options,
    );

    return {
      ...metrics,
      fileName: file.name,
      sizeBytes: file.size,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }

    throw new Error('That file could not be decoded. Use a valid WAV or MP3 file.');
  } finally {
    void context.close();
  }
}
