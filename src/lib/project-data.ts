import type { AudioMetrics, MixReport, SoundscapeBlueprint } from '@/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isArrangementSection(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.energy === 'number' &&
    Array.isArray(value.elements)
  );
}

function isLayer(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.role === 'string' &&
    typeof value.description === 'string'
  );
}

function isChainStep(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.plugin === 'string' &&
    typeof value.purpose === 'string' &&
    typeof value.placement === 'string' &&
    typeof value.startingPoint === 'string'
  );
}

/** Guards stored blueprints so legacy or partial records cannot crash the UI. */
export function isSoundscapeBlueprint(value: unknown): value is SoundscapeBlueprint {
  if (!isRecord(value) || !isRecord(value.mood)) {
    return false;
  }

  return (
    typeof value.title === 'string' &&
    typeof value.summary === 'string' &&
    typeof value.mood.primary === 'string' &&
    isStringArray(value.mood.secondary) &&
    Array.isArray(value.arrangement) &&
    value.arrangement.every(isArrangementSection) &&
    Array.isArray(value.layers) &&
    value.layers.every(isLayer) &&
    Array.isArray(value.flStudioChain) &&
    value.flStudioChain.every(isChainStep) &&
    isStringArray(value.foleyAndAmbience) &&
    isStringArray(value.automation) &&
    isStringArray(value.transitions) &&
    isStringArray(value.productionNotes) &&
    isStringArray(value.assumptions) &&
    isStringArray(value.uncertainty)
  );
}

export function isAudioMetrics(value: unknown): value is AudioMetrics {
  if (!isRecord(value) || !isRecord(value.bandEnergy)) {
    return false;
  }

  return (
    (value.channels === 1 || value.channels === 2) &&
    typeof value.durationSeconds === 'number' &&
    typeof value.bandEnergy.low === 'number' &&
    typeof value.bandEnergy.mid === 'number' &&
    typeof value.bandEnergy.high === 'number' &&
    'samplePeakDbfs' in value &&
    'rmsDbfs' in value &&
    'crestFactorDb' in value &&
    'stereoCorrelation' in value
  );
}

export function isMixReport(value: unknown): value is MixReport {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isStringArray(value.measuredFacts) &&
    isStringArray(value.hypotheses) &&
    isStringArray(value.recommendations) &&
    isStringArray(value.limitations)
  );
}
