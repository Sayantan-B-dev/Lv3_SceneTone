import { describe, expect, it } from 'vitest';
import { computeMetrics, type AudioBufferLike } from './audio-analysis';

function buffer(channels: Float32Array[], sampleRate = 44100): AudioBufferLike {
  return {
    numberOfChannels: channels.length,
    sampleRate,
    length: channels[0]!.length,
    duration: channels[0]!.length / sampleRate,
    getChannelData: (channel: number) => channels[channel]!,
  };
}

function sine(frequency: number, samples = 4096, sampleRate = 44100): Float32Array {
  const data = new Float32Array(samples);
  for (let index = 0; index < samples; index += 1) {
    data[index] = 0.5 * Math.sin((2 * Math.PI * frequency * index) / sampleRate);
  }
  return data;
}

describe('local audio metrics', () => {
  it('reports silence as unavailable levels instead of fake numbers', () => {
    const metrics = computeMetrics(buffer([new Float32Array(2048)]));

    expect(metrics.channels).toBe(1);
    expect(metrics.samplePeakDbfs).toBeNull();
    expect(metrics.rmsDbfs).toBeNull();
    expect(metrics.crestFactorDb).toBeNull();
    expect(metrics.stereoCorrelation).toBeNull();
    expect(metrics.bandEnergy).toEqual({ low: 0, mid: 0, high: 0 });
  });

  it('measures a mono sine and leaves correlation unavailable', () => {
    const metrics = computeMetrics(buffer([sine(440)]));

    expect(metrics.channels).toBe(1);
    expect(metrics.samplePeakDbfs).toBeCloseTo(-6.02, 1);
    expect(metrics.rmsDbfs).toBeCloseTo(-9.03, 1);
    expect(metrics.crestFactorDb).toBeCloseTo(3.01, 1);
    expect(metrics.stereoCorrelation).toBeNull();
  });

  it('puts most energy in the band that contains the tone', () => {
    expect(computeMetrics(buffer([sine(100)])).bandEnergy.low).toBeGreaterThan(0.8);
    expect(computeMetrics(buffer([sine(1000)])).bandEnergy.mid).toBeGreaterThan(0.8);
    expect(computeMetrics(buffer([sine(12000)])).bandEnergy.high).toBeGreaterThan(0.8);
  });

  it('reports positive correlation for identical stereo channels', () => {
    const mono = sine(440);
    const metrics = computeMetrics(buffer([mono, mono.slice()]));

    expect(metrics.channels).toBe(2);
    expect(metrics.stereoCorrelation).toBeGreaterThan(0.99);
  });

  it('reports negative correlation for inverted stereo channels', () => {
    const mono = sine(440);
    const inverted = mono.map((sample) => -sample);
    const metrics = computeMetrics(buffer([mono, inverted]));

    expect(metrics.channels).toBe(2);
    expect(metrics.stereoCorrelation).toBeLessThan(-0.99);
  });
});
