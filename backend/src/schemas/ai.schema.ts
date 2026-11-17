import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier.');

export const bandEnergySchema = z.object({
  low: z.number().min(0).max(1),
  mid: z.number().min(0).max(1),
  high: z.number().min(0).max(1),
});

// Decoded lossy files can overshoot full scale, so peaks slightly above 0 dBFS are valid.
export const audioMetricsSchema = z.object({
  channels: z.union([z.literal(1), z.literal(2)]),
  durationSeconds: z.number().positive().max(86_400),
  samplePeakDbfs: z.number().min(-200).max(24).nullable(),
  rmsDbfs: z.number().min(-200).max(24).nullable(),
  crestFactorDb: z.number().nonnegative().max(200).nullable(),
  bandEnergy: bandEnergySchema,
  stereoCorrelation: z.number().min(-1).max(1).nullable(),
});

export const blueprintRequestSchema = z.object({
  sceneDescription: z.string().trim().min(10).max(4000),
  durationSeconds: z.number().positive().max(3600).optional(),
  styleDirection: z.string().trim().max(500).optional(),
  emotionalArc: z.string().trim().max(1000).optional(),
  platform: z.string().trim().max(200).optional(),
  constraints: z.string().trim().max(1000).optional(),
  projectId: objectIdSchema.optional(),
});

export const mixReportRequestSchema = z.object({
  objective: z.string().trim().min(3).max(1000),
  metrics: audioMetricsSchema,
  projectId: objectIdSchema.optional(),
  projectContext: z
    .object({
      name: z.string().trim().max(120).optional(),
      sceneBrief: z.string().trim().max(4000).optional(),
      blueprintSummary: z.string().trim().max(2000).optional(),
    })
    .optional(),
});

const energyPointSchema = z.object({
  position: z.number().min(0).max(1),
  energy: z.number().min(0).max(1),
});

const arrangementSectionSchema = z.object({
  name: z.string().min(1),
  bars: z.number().int().nonnegative().nullable(),
  energy: z.number().min(0).max(1),
  elements: z.array(z.string()),
  notes: z.string().nullable(),
});

const layerSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  description: z.string().min(1),
  frequencyFocus: z.string().nullable(),
});

const pluginSuggestionSchema = z.object({
  plugin: z.string().min(1),
  purpose: z.string().min(1),
  placement: z.string().min(1),
  startingPoint: z.string().min(1),
});

export const soundscapeBlueprintSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  bpm: z.number().int().positive().max(300).nullable(),
  key: z.string().nullable(),
  mood: z.object({
    primary: z.string().min(1),
    secondary: z.array(z.string()),
    energyCurve: z.array(energyPointSchema),
  }),
  arrangement: z.array(arrangementSectionSchema),
  layers: z.array(layerSchema),
  foleyAndAmbience: z.array(z.string()),
  automation: z.array(z.string()),
  transitions: z.array(z.string()),
  productionNotes: z.array(z.string()),
  flStudioChain: z.array(pluginSuggestionSchema),
  assumptions: z.array(z.string()),
  uncertainty: z.array(z.string()),
});

export const mixReportSchema = z.object({
  measuredFacts: z.array(z.string().min(1)).min(1),
  hypotheses: z.array(z.string()),
  recommendations: z.array(z.string()),
  limitations: z.array(z.string()),
});

export const guideRequestSchema = z.object({
  question: z.string().trim().min(1).max(500),
  pageContext: z.string().trim().max(6000).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(1000),
      }),
    )
    .max(6)
    .optional(),
});

export type AudioMetrics = z.infer<typeof audioMetricsSchema>;
export type GuideRequest = z.infer<typeof guideRequestSchema>;
export type BlueprintRequest = z.infer<typeof blueprintRequestSchema>;
export type MixReportRequest = z.infer<typeof mixReportRequestSchema>;
export type SoundscapeBlueprint = z.infer<typeof soundscapeBlueprintSchema>;
export type MixReport = z.infer<typeof mixReportSchema>;
