import type { HydratedDocument } from 'mongoose';
import { AppError } from '../lib/errors.js';
import { ProjectModel, type Project } from '../models/Project.js';
import type { AudioMetrics, MixReport, SoundscapeBlueprint } from '../schemas/ai.schema.js';
import type { CreateProjectRequest, UpdateProjectRequest } from '../schemas/project.schema.js';

export type ProjectDocument = HydratedDocument<Project> & {
  createdAt: Date;
  updatedAt: Date;
};

export function toProjectDto(project: ProjectDocument) {
  return {
    id: project._id.toString(),
    name: project.name,
    sceneBrief: project.sceneBrief ?? '',
    blueprint: project.blueprint ?? null,
    audioAnalysis: project.audioAnalysis ?? null,
    mixReport: project.mixReport ?? null,
    schemaVersion: project.schemaVersion ?? 1,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

function notFound(): AppError {
  return new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found.');
}

export async function listProjects(ownerId: string): Promise<ProjectDocument[]> {
  return ProjectModel.find({ userId: ownerId })
    .sort({ updatedAt: -1 })
    .exec() as unknown as Promise<ProjectDocument[]>;
}

export async function createProject(
  ownerId: string,
  input: CreateProjectRequest,
): Promise<ProjectDocument> {
  const project = await ProjectModel.create({
    userId: ownerId,
    name: input.name,
    ...(input.sceneBrief === undefined ? {} : { sceneBrief: input.sceneBrief }),
  });

  return project as ProjectDocument;
}

export async function getProject(
  ownerId: string,
  projectId: string,
): Promise<ProjectDocument> {
  const project = await ProjectModel.findOne({ _id: projectId, userId: ownerId }).exec();
  if (!project) {
    throw notFound();
  }

  return project as ProjectDocument;
}

export async function updateProject(
  ownerId: string,
  projectId: string,
  input: UpdateProjectRequest,
): Promise<ProjectDocument> {
  const project = await ProjectModel.findOneAndUpdate(
    { _id: projectId, userId: ownerId },
    { $set: input },
    { new: true, runValidators: true },
  ).exec();

  if (!project) {
    throw notFound();
  }

  return project as ProjectDocument;
}

export async function saveBlueprint(
  ownerId: string,
  projectId: string,
  blueprint: SoundscapeBlueprint,
): Promise<ProjectDocument> {
  const project = await ProjectModel.findOneAndUpdate(
    { _id: projectId, userId: ownerId },
    { $set: { blueprint } },
    { new: true },
  ).exec();

  if (!project) {
    throw notFound();
  }

  return project as ProjectDocument;
}

export async function saveMixReport(
  ownerId: string,
  projectId: string,
  mixReport: MixReport,
  audioAnalysis: AudioMetrics,
): Promise<ProjectDocument> {
  const project = await ProjectModel.findOneAndUpdate(
    { _id: projectId, userId: ownerId },
    { $set: { mixReport, audioAnalysis } },
    { new: true },
  ).exec();

  if (!project) {
    throw notFound();
  }

  return project as ProjectDocument;
}

export async function deleteProject(ownerId: string, projectId: string): Promise<void> {
  const project = await ProjectModel.findOneAndDelete({
    _id: projectId,
    userId: ownerId,
  }).exec();

  if (!project) {
    throw notFound();
  }
}
