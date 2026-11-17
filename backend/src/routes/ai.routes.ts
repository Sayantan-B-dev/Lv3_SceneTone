import { Router } from 'express';
import { generateBlueprint, generateMixReport } from '../controllers/ai.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/security.js';
import { validateBody } from '../middleware/validate.js';
import { blueprintRequestSchema, mixReportRequestSchema } from '../schemas/ai.schema.js';

export const aiRouter = Router();

aiRouter.use(requireAuth, aiRateLimiter);

aiRouter.post('/blueprint', validateBody(blueprintRequestSchema), generateBlueprint);
aiRouter.post('/mix-report', validateBody(mixReportRequestSchema), generateMixReport);
