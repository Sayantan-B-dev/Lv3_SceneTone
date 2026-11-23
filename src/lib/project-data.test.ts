import { describe, expect, it } from 'vitest';
import type { AudioMetrics, MixReport, SoundscapeBlueprint } from '@/types';
import { isAudioMetrics, isMixReport, isSoundscapeBlueprint } from './project-data';

const blueprint: SoundscapeBlueprint = {
  title: 'Rain alley',
  summary: 'A narrow alley under neon rain.',
  bpm: 72,
  key: 'D minor',
  mood: { primary: 'tense', secondary: ['hopeful'], energyCurve: [{ position: 0, energy: 0.2 }] },
  arrangement: [{ name: 'Establish', bars: 8, energy: 0.2, elements: ['drone'], notes: null }],
  layers: [
    { name: 'Bed', role: 'foundation', description: 'Low drone', frequencyFocus: '40-120 Hz' },
  ],
  foleyAndAmbience: ['rain on metal'],
  automation: ['open filter'],
  transitions: ['reverse swell'],
  productionNotes: ['keep it sparse'],
  flStudioChain: [
    {
      plugin: 'Fruity Parametric EQ 2',
      purpose: 'remove rumble',
      placement: 'first',
      startingPoint: 'high-pass at 30 Hz',
    },
  ],
  assumptions: ['tempo is a suggestion'],
  uncertainty: ['layer count may vary'],
};

const metrics: AudioMetrics = {
  channels: 2,
  durationSeconds: 12,
  samplePeakDbfs: -1.2,
  rmsDbfs: -16.4,
  crestFactorDb: 15.2,
  bandEnergy: { low: 0.5, mid: 0.3, high: 0.2 },
  stereoCorrelation: 0.4,
};

const report: MixReport = {
  measuredFacts: ['Duration 12.0 s, stereo.'],
  hypotheses: ['Low band dominance suggests a bass-heavy bed.'],
  recommendations: ['High-pass at 30 Hz.'],
  limitations: ['RMS is not LUFS.'],
};

describe('stored project guards', () => {
  it('accepts a complete saved blueprint', () => {
    expect(isSoundscapeBlueprint(blueprint)).toBe(true);
  });

  it('rejects partial or malformed blueprints', () => {
    expect(isSoundscapeBlueprint(null)).toBe(false);
    expect(isSoundscapeBlueprint({ title: 'x' })).toBe(false);
    expect(isSoundscapeBlueprint({ ...blueprint, arrangement: [{ name: 'x' }] })).toBe(false);
  });

  it('accepts saved metrics and rejects impossible channel counts', () => {
    expect(isAudioMetrics(metrics)).toBe(true);
    expect(isAudioMetrics({ ...metrics, channels: 3 })).toBe(false);
    expect(isAudioMetrics({ ...metrics, bandEnergy: null })).toBe(false);
  });

  it('accepts a saved mix report and rejects missing lists', () => {
    expect(isMixReport(report)).toBe(true);
    expect(isMixReport({ ...report, limitations: undefined })).toBe(false);
  });
});
