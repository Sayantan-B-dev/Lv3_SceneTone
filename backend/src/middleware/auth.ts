import type { Request, RequestHandler } from 'express';
import { AppError } from '../lib/errors.js';

export function requireSessionUserId(req: Request): string {
  const userId = req.session.userId;
  if (!userId) {
    throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.');
  }

  return userId;
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  if (!req.session.userId) {
    next(new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.'));
    return;
  }

  next();
};
