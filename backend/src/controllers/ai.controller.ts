import type { RequestHandler } from 'express';
import { notImplemented } from '../lib/errors.js';

export const generateBlueprint: RequestHandler = () => {
  throw notImplemented('Scene blueprint generation');
};

export const generateMixReport: RequestHandler = () => {
  throw notImplemented('Mix report generation');
};
