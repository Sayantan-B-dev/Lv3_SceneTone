import { Router } from 'express';
import { generateBlueprint, generateMixReport, guideChat } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { aiRateLimiter, guideRateLimiter } from '../middleware/security.js';
import { validateBody } from '../middleware/validate.js';
import {
  blueprintRequestSchema,
  guideRequestSchema,
  mixReportRequestSchema,
} from '../schemas/ai.schema.js';

export const aiRouter = Router();

// The page guide is public so it can explain the landing page before sign-in.
aiRouter.post('/guide', guideRateLimiter, validateBody(guideRequestSchema), guideChat);

aiRouter.use(requireAuth, aiRateLimiter);

aiRouter.post('/blueprint', validateBody(blueprintRequestSchema), generateBlueprint);
aiRouter.post('/mix-report', validateBody(mixReportRequestSchema), generateMixReport);
