import { randomBytes } from 'node:crypto';
import type { Request, RequestHandler } from 'express';
import { env, isProduction } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { SESSION_COOKIE_NAME } from '../middleware/session.js';
import {
  buildGoogleAuthUrl,
  exchangeGoogleCode,
  verifyGoogleIdToken,
} from '../services/google.js';
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

export const startGoogleRedirect: RequestHandler = async (req, res) => {
  const state = randomBytes(32).toString('hex');
  req.session.oauthState = state;
  await saveSession(req);

  res.redirect(buildGoogleAuthUrl(state));
};

export const handleGoogleCallback: RequestHandler = async (req, res) => {
  const { code, state, error } = req.query as {
    code?: string;
    state?: string;
    error?: string;
  };
  const expectedState = req.session.oauthState;
  delete req.session.oauthState;

  if (error || !code || !state || !expectedState || state !== expectedState) {
    res.redirect(`${env.FRONTEND_ORIGIN}/dashboard?auth=failed`);
    return;
  }

  let identity;
  try {
    identity = await exchangeGoogleCode(code);
  } catch (exchangeError) {
    if (!(exchangeError instanceof AppError) || exchangeError.statusCode >= 500) {
      logger.warn({ err: exchangeError }, 'Google authorization code exchange failed');
    }
    res.redirect(`${env.FRONTEND_ORIGIN}/dashboard?auth=failed`);
    return;
  }

  const user = await upsertGoogleUser(identity);
  await regenerateSession(req);
  req.session.userId = user._id.toString();
  await saveSession(req);

  res.redirect(`${env.FRONTEND_ORIGIN}/dashboard?auth=success`);
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
