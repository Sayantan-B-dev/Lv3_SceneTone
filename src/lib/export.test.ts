import { describe, expect, it } from 'vitest';
import type { AudioMetrics, MixReport, SoundscapeBlueprint } from '@/types';
import { blueprintToMarkdown, exportBaseName, reportToMarkdown } from './export';

const blueprint: SoundscapeBlueprint = {
  title: 'Rain alley',
  summary: 'A narrow alley under neon rain.',
  bpm: 72,
  key: 'D minor',
  mood: { primary: 'tense', secondary: ['hopeful'], energyCurve: [{ position: 0, energy: 0.2 }] },
  arrangement: [
    { name: 'Establish', bars: 8, energy: 0.2, elements: ['drone'], notes: null },
  ],
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
  recommendations: ['High-pass at 30 Hz with Fruity Parametric EQ 2.'],
  limitations: ['RMS is not LUFS.'],
};

describe('exports', () => {
  it('renders a markdown blueprint with sections, chain and assumptions', () => {
    const markdown = blueprintToMarkdown(blueprint, {
      model: 'test-model',
      generatedAt: '2026-11-17T10:00:00.000Z',
    });

    expect(markdown).toContain('# Rain alley');
    expect(markdown).toContain('### Establish');
    expect(markdown).toContain('Fruity Parametric EQ 2');
    expect(markdown).toContain('tempo is a suggestion');
    expect(markdown).toContain('test-model');
  });

  it('renders a mix report with facts separated and the listening disclaimer', () => {
    const markdown = reportToMarkdown(report, {
      objective: 'Streaming master',
      metrics,
      model: 'test-model',
    });

    expect(markdown).toContain('## Measured facts');
    expect(markdown).toContain('Duration 12.0 s, stereo.');
    expect(markdown).toContain('## Limitations');
    expect(markdown).toContain('did not listen to the audio');
    expect(markdown).not.toContain('undefined');
  });

  it('builds safe filenames from titles', () => {
    expect(exportBaseName('Rain-lit Rooftop Chase!')).toBe('rain-lit-rooftop-chase');
    expect(exportBaseName('!!!')).toBe('scenetone');
  });
});
