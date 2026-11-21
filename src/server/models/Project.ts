import { Schema, model, models, type InferSchemaType } from 'mongoose';

const bandEnergySchema = new Schema(
  {
    low: { type: Number, required: true, min: 0, max: 1 },
    mid: { type: Number, required: true, min: 0, max: 1 },
    high: { type: Number, required: true, min: 0, max: 1 },
  },
  { _id: false },
);

const audioAnalysisSchema = new Schema(
  {
    channels: { type: Number, required: true, min: 1, max: 2 },
    durationSeconds: { type: Number, required: true, min: 0 },
    samplePeakDbfs: { type: Number, default: null, max: 0 },
    rmsDbfs: { type: Number, default: null, max: 0 },
    crestFactorDb: { type: Number, default: null, min: 0 },
    bandEnergy: { type: bandEnergySchema, required: true },
    stereoCorrelation: { type: Number, default: null, min: -1, max: 1 },
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    sceneBrief: { type: String, default: '', maxlength: 4000 },
    blueprint: { type: Schema.Types.Mixed, default: null },
    audioAnalysis: { type: audioAnalysisSchema, default: null },
    mixReport: { type: Schema.Types.Mixed, default: null },
    schemaVersion: { type: Number, default: 1 },
  },
  { timestamps: true, versionKey: false },
);

projectSchema.index({ userId: 1, updatedAt: -1 });

export type Project = InferSchemaType<typeof projectSchema>;

export const ProjectModel = models.Project ?? model('Project', projectSchema);
