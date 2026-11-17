import { Router } from 'express';
import {
  getCurrentUser,
  handleGoogleCallback,
  signInWithGoogle,
  signOut,
  startGoogleRedirect,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/security.js';
import { validateBody } from '../middleware/validate.js';
import { googleAuthSchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

authRouter.post('/google', authRateLimiter, validateBody(googleAuthSchema), signInWithGoogle);
authRouter.get('/google/start', authRateLimiter, startGoogleRedirect);
authRouter.get('/google/callback', authRateLimiter, handleGoogleCallback);
authRouter.get('/me', requireAuth, getCurrentUser);
authRouter.post('/logout', requireAuth, signOut);
