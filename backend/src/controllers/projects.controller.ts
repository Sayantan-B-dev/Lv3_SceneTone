import type { RequestHandler } from 'express';
import { notImplemented } from '../lib/errors.js';

export const listProjects: RequestHandler = () => {
  throw notImplemented('Project listing');
};

export const createProject: RequestHandler = () => {
  throw notImplemented('Project creation');
};

export const getProject: RequestHandler = () => {
  throw notImplemented('Project lookup');
};

export const updateProject: RequestHandler = () => {
  throw notImplemented('Project update');
};

export const deleteProject: RequestHandler = () => {
  throw notImplemented('Project deletion');
};
