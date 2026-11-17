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
