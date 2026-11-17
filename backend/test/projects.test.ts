import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectModel } from '../src/models/Project.js';
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from '../src/services/projects.service.js';

const ownerA = '507f1f77bcf86cd799439011';
const ownerB = '507f1f77bcf86cd799439012';
const projectId = '507f1f77bcf86cd799439013';

const project = {
  _id: { toString: () => projectId },
  userId: ownerA,
  name: 'Rain alley',
  sceneBrief: 'Neon rain in a narrow alley.',
  blueprint: null,
  audioAnalysis: null,
  mixReport: null,
  schemaVersion: 1,
  createdAt: new Date('2026-11-17T10:00:00Z'),
  updatedAt: new Date('2026-11-17T10:00:00Z'),
};

function fakeProjects() {
  return [{ ...project }];
}

function matchingProject(filter: Record<string, unknown>) {
  return (
    fakeProjects().find(
      (item) => item._id.toString() === filter._id && item.userId === filter.userId,
    ) ?? null
  );
}

function query(result: unknown) {
  return { exec: vi.fn().mockResolvedValue(result) } as never;
}

describe('project service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lists only the owner projects', async () => {
    const exec = vi.fn().mockResolvedValue(fakeProjects());
    const sort = vi.fn().mockReturnValue({ exec });
    const find = vi.spyOn(ProjectModel, 'find').mockReturnValue({ sort } as never);

    const result = await listProjects(ownerA);

    expect(find).toHaveBeenCalledWith({ userId: ownerA });
    expect(sort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(result).toHaveLength(1);
  });

  it('creates a project owned by the authenticated user', async () => {
    const create = vi
      .spyOn(ProjectModel, 'create')
      .mockResolvedValue(project as never);

    const result = await createProject(ownerA, { name: 'Rain alley' });

    expect(create).toHaveBeenCalledWith({ userId: ownerA, name: 'Rain alley' });
    expect(result).toBe(project);
  });

  it('reads a project only when both id and owner match', async () => {
    const findOne = vi
      .spyOn(ProjectModel, 'findOne')
      .mockImplementation((filter) => query(matchingProject(filter as Record<string, unknown>)));

    await expect(getProject(ownerA, projectId)).resolves.toMatchObject({ _id: project._id, userId: ownerA });
    expect(findOne).toHaveBeenCalledWith({ _id: projectId, userId: ownerA });

    await expect(getProject(ownerB, projectId)).rejects.toMatchObject({
      statusCode: 404,
      code: 'PROJECT_NOT_FOUND',
    });
  });

  it('updates with non-matching owner filters rejected', async () => {
    const findOneAndUpdate = vi
      .spyOn(ProjectModel, 'findOneAndUpdate')
      .mockImplementation((filter) =>
        query(matchingProject(filter as Record<string, unknown>)),
      );

    const updated = await updateProject(ownerA, projectId, { name: 'Dry alley' });
    expect(updated).toMatchObject({ _id: project._id, userId: ownerA });
    expect(findOneAndUpdate).toHaveBeenCalledWith(
      { _id: projectId, userId: ownerA },
      { $set: { name: 'Dry alley' } },
      { new: true, runValidators: true },
    );

    await expect(updateProject(ownerB, projectId, { name: 'Dry alley' })).rejects.toMatchObject({
      statusCode: 404,
      code: 'PROJECT_NOT_FOUND',
    });
  });

  it('deletes a project only for its owner', async () => {
    vi.spyOn(ProjectModel, 'findOneAndDelete').mockImplementation((filter) =>
      query(matchingProject(filter as Record<string, unknown>)),
    );

    await expect(deleteProject(ownerA, projectId)).resolves.toBeUndefined();

    await expect(deleteProject(ownerB, projectId)).rejects.toMatchObject({
      statusCode: 404,
      code: 'PROJECT_NOT_FOUND',
    });
  });
});
