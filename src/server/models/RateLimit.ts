import { Schema, model, models, type InferSchemaType } from 'mongoose';

const rateLimitSchema = new Schema(
  {
    _id: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
    resetAt: { type: Date, required: true },
  },
  { versionKey: false },
);

rateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

export type RateLimit = InferSchemaType<typeof rateLimitSchema>;

export const RateLimitModel = models.RateLimit ?? model('RateLimit', rateLimitSchema);
