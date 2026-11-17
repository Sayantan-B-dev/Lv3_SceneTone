import type { Request, RequestHandler } from 'express';
import type { CreateProjectRequest, UpdateProjectRequest } from '../schemas/project.schema.js';
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  toProjectDto,
  updateProject,
} from '../services/projects.service.js';

function paramId(req: Request): string {
  return req.params.projectId as string;
}

function ownerId(req: Request): string {
  const userId = req.session.userId;
  if (!userId) {
    throw new Error('Authenticated route called without a session user.');
  }
  return userId;
}

export const listAllProjects: RequestHandler = async (req, res) => {
  const projects = await listProjects(ownerId(req));
  res.json({ projects: projects.map(toProjectDto) });
};

export const createOneProject: RequestHandler = async (req, res) => {
  const project = await createProject(ownerId(req), req.body as CreateProjectRequest);
  res.status(201).json({ project: toProjectDto(project) });
};

export const getOneProject: RequestHandler = async (req, res) => {
  const project = await getProject(ownerId(req), paramId(req));
  res.json({ project: toProjectDto(project) });
};

export const updateOneProject: RequestHandler = async (req, res) => {
  const project = await updateProject(
    ownerId(req),
    paramId(req),
    req.body as UpdateProjectRequest,
  );
  res.json({ project: toProjectDto(project) });
};

export const deleteOneProject: RequestHandler = async (req, res) => {
  await deleteProject(ownerId(req), paramId(req));
  res.status(204).end();
};
