import { Schema, model, models, type InferSchemaType } from 'mongoose';

const preferencesSchema = new Schema(
  {
    theme: {
      type: String,
      enum: ['system', 'light', 'dark'],
      default: 'system',
    },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    emailNormalized: { type: String, required: true, index: true },
    name: { type: String, required: true },
    avatarUrl: { type: String, default: null },
    preferences: { type: preferencesSchema, default: () => ({}) },
  },
  { timestamps: true, versionKey: false },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = models.User ?? model('User', userSchema);
