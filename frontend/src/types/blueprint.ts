export interface EnergyPoint {
  position: number;
  energy: number;
}

export interface MoodProfile {
  primary: string;
  secondary: string[];
  energyCurve: EnergyPoint[];
}

export interface ArrangementSection {
  name: string;
  bars: number | null;
  energy: number;
  elements: string[];
  notes: string | null;
}

export interface BlueprintLayer {
  name: string;
  role: string;
  description: string;
  frequencyFocus: string | null;
}

export interface FlStudioPluginSuggestion {
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
  mood: MoodProfile;
  arrangement: ArrangementSection[];
  layers: BlueprintLayer[];
  foleyAndAmbience: string[];
  automation: string[];
  transitions: string[];
  productionNotes: string[];
  flStudioChain: FlStudioPluginSuggestion[];
  assumptions: string[];
  uncertainty: string[];
}

export interface MixReport {
  measuredFacts: string[];
  hypotheses: string[];
  recommendations: string[];
  limitations: string[];
}
