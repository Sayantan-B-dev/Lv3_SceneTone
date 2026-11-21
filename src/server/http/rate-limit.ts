import type { NextRequest } from 'next/server';
import { isTest } from '../config/env';
import { connectDatabase } from '../db/connect';
import { AppError } from '../lib/errors';
import { RateLimitModel } from '../models/RateLimit';

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]!.trim();
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function enforceRateLimit(
  request: NextRequest,
  scope: string,
  limit: number,
  windowMs: number,
): Promise<void> {
  if (isTest) {
    return;
  }

  await connectDatabase();
  const key = `${scope}:${clientKey(request)}`;
  const now = new Date();
  const existing = (await RateLimitModel.findOneAndUpdate(
    { _id: key, resetAt: { $gt: now } },
    { $inc: { count: 1 } },
    { new: true },
  ).lean()) as { count: number } | null;

  if (!existing) {
    await RateLimitModel.updateOne(
      { _id: key },
      { $set: { count: 1, resetAt: new Date(now.getTime() + windowMs) } },
      { upsert: true },
    ).exec();
    return;
  }

  if (existing.count > limit) {
    throw new AppError(429, 'RATE_LIMITED', 'Too many requests. Try again later.');
  }
}
