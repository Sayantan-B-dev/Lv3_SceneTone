import { isValidObjectId, type HydratedDocument } from 'mongoose';
import { UserModel, type User } from '../models/User';
import type { VerifiedGoogleIdentity } from './google';

export type UserDocument = HydratedDocument<User>;

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  preferences: {
    theme: 'system' | 'light' | 'dark';
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function upsertGoogleUser(
  identity: VerifiedGoogleIdentity,
): Promise<UserDocument> {
  const email = identity.email.trim();
  const fields = {
    email,
    emailNormalized: email.toLowerCase(),
    name: identity.name.trim() || email,
    avatarUrl: identity.avatarUrl ?? null,
  };

  try {
    const user = await UserModel.findOneAndUpdate(
      { googleId: identity.googleId },
      {
        $set: fields,
        $setOnInsert: {
          googleId: identity.googleId,
          preferences: { theme: 'system' },
        },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).exec();

    if (!user) {
      throw new Error('User upsert returned no document.');
    }

    return user as unknown as UserDocument;
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    const existing = await UserModel.findOne({ googleId: identity.googleId }).exec();
    if (!existing) {
      throw error;
    }

    return existing as unknown as UserDocument;
  }
}

export async function findUserById(userId: string): Promise<UserDocument | null> {
  if (!isValidObjectId(userId)) {
    return null;
  }

  const user = await UserModel.findById(userId).exec();
  return user as unknown as UserDocument | null;
}

export function toPublicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl ?? null,
    preferences: {
      theme: user.preferences?.theme ?? 'system',
    },
  };
}
