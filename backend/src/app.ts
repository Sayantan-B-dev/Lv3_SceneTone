import express from 'express';
import { apiRouter } from './routes/index.js';
import { isProduction } from './config/env.js';
import { httpLogger } from './lib/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import {
  apiRateLimiter,
  corsMiddleware,
  sameOriginGuard,
  securityHeaders,
} from './middleware/security.js';
import { sessionMiddleware } from './middleware/session.js';

export function buildApp() {
  const app = express();

  app.disable('x-powered-by');
  if (isProduction) {
    app.set('trust proxy', 1);
  }

  app.use(httpLogger);
  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(sessionMiddleware);
  app.use(sameOriginGuard);

  app.use('/api/v1', apiRateLimiter);
  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
