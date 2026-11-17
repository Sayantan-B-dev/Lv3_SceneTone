import { Router } from 'express';
import {
  createOneProject,
  deleteOneProject,
  getOneProject,
  listAllProjects,
  updateOneProject,
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

projectsRouter.get('/', listAllProjects);
projectsRouter.post('/', validateBody(createProjectSchema), createOneProject);
projectsRouter.get('/:projectId', validateParams(projectIdParamsSchema), getOneProject);
projectsRouter.patch(
  '/:projectId',
  validateParams(projectIdParamsSchema),
  validateBody(updateProjectSchema),
  updateOneProject,
);
projectsRouter.delete('/:projectId', validateParams(projectIdParamsSchema), deleteOneProject);
