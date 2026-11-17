import { Router } from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from '../controllers/projects.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  createProjectSchema,
  projectIdParamsSchema,
  updateProjectSchema,
} from '../schemas/project.schema.js';

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

projectsRouter.get('/', listProjects);
projectsRouter.post('/', validateBody(createProjectSchema), createProject);
projectsRouter.get('/:projectId', validateParams(projectIdParamsSchema), getProject);
projectsRouter.patch(
  '/:projectId',
  validateParams(projectIdParamsSchema),
  validateBody(updateProjectSchema),
  updateProject,
);
projectsRouter.delete('/:projectId', validateParams(projectIdParamsSchema), deleteProject);
