import type { Request, RequestHandler } from 'express';
import { isProduction } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { SESSION_COOKIE_NAME } from '../middleware/session.js';
import { verifyGoogleIdToken } from '../services/google.js';
import { findUserById, toPublicUser, upsertGoogleUser } from '../services/users.service.js';

function regenerateSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function saveSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

export const signInWithGoogle: RequestHandler = async (req, res) => {
  const { credential } = req.body as { credential: string };

  let identity;
  try {
    identity = await verifyGoogleIdToken(credential);
  } catch (error) {
    if (error instanceof AppError && error.statusCode < 500) {
      throw error;
    }

    logger.warn({ err: error }, 'Google credential verification failed');
    throw new AppError(401, 'INVALID_GOOGLE_TOKEN', 'Google credential could not be verified.');
  }

  const user = await upsertGoogleUser(identity);

  await regenerateSession(req);
  req.session.userId = user._id.toString();
  await saveSession(req);

  res.status(200).json({ user: toPublicUser(user) });
};

export const getCurrentUser: RequestHandler = async (req, res) => {
  const userId = req.session.userId;
  const user = userId ? await findUserById(userId) : null;

  if (!user) {
    await destroySession(req);
    throw new AppError(401, 'UNAUTHENTICATED', 'Authentication is required.');
  }

  res.json({ user: toPublicUser(user) });
};

export const signOut: RequestHandler = async (req, res) => {
  await destroySession(req);
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  });
  res.status(204).end();
};
