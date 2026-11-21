import { Schema, model, models, type InferSchemaType } from 'mongoose';

const sessionSchema = new Schema(
  {
    sidHash: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type Session = InferSchemaType<typeof sessionSchema>;

export const SessionModel = models.Session ?? model('Session', sessionSchema);
