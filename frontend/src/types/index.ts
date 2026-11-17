export type ThemePreference = 'system' | 'light' | 'dark';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  preferences: {
    theme: ThemePreference;
  };
}

export interface Project {
  id: string;
  name: string;
  sceneBrief: string;
  blueprint: unknown;
  audioAnalysis: unknown;
  mixReport: unknown;
  createdAt: string;
  updatedAt: string;
  schemaVersion: number;
}

export interface BandEnergy {
  low: number;
  mid: number;
  high: number;
}

export interface AudioMetrics {
  channels: 1 | 2;
  durationSeconds: number;
  samplePeakDbfs: number | null;
  rmsDbfs: number | null;
  crestFactorDb: number | null;
  bandEnergy: BandEnergy;
  stereoCorrelation: number | null;
}

export interface EnergyPoint {
  position: number;
  energy: number;
}

export interface ArrangementSection {
  name: string;
  bars: number | null;
  energy: number;
  elements: string[];
  notes: string | null;
}

export interface SoundscapeLayer {
  name: string;
  role: string;
  description: string;
  frequencyFocus: string | null;
}

export interface PluginSuggestion {
  plugin: string;
  purpose: string;
  placement: string;
  startingPoint: string;
}

export interface SoundscapeBlueprint {
  title: string;
  summary: string;
  bpm: number | null;
  key: string | null;
  mood: {
    primary: string;
    secondary: string[];
    energyCurve: EnergyPoint[];
  };
  arrangement: ArrangementSection[];
  layers: SoundscapeLayer[];
  foleyAndAmbience: string[];
  automation: string[];
  transitions: string[];
  productionNotes: string[];
  flStudioChain: PluginSuggestion[];
  assumptions: string[];
  uncertainty: string[];
}

export interface MixReport {
  measuredFacts: string[];
  hypotheses: string[];
  recommendations: string[];
  limitations: string[];
}

export interface AiResponse<T> {
  model: string | null;
  provider?: string;
  persisted: boolean;
  project: Project | null;
  blueprint?: T;
  report?: T;
}
