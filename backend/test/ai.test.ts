import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { AppError } from '../src/lib/errors.js';

const mocks = vi.hoisted(() => ({
  verifyGoogleIdToken: vi.fn(),
  upsertGoogleUser: vi.fn(),
  findUserById: vi.fn(),
  requestStructuredOutput: vi.fn(),
  saveBlueprint: vi.fn(),
  saveMixReport: vi.fn(),
}));

vi.mock('../src/services/google.js', () => ({
  verifyGoogleIdToken: mocks.verifyGoogleIdToken,
  buildGoogleAuthUrl: () => 'https://accounts.google.com/o/oauth2/v2/auth?state=test',
  exchangeGoogleCode: mocks.verifyGoogleIdToken,
}));

vi.mock('../src/services/users.service.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/users.service.js')>();
  return {
    ...actual,
    upsertGoogleUser: mocks.upsertGoogleUser,
    findUserById: mocks.findUserById,
  };
});

vi.mock('../src/services/adaption.service.js', () => ({
  requestStructuredOutput: mocks.requestStructuredOutput,
  isAiConfigured: () => true,
}));

vi.mock('../src/services/projects.service.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/projects.service.js')>();
  return {
    ...actual,
    saveBlueprint: mocks.saveBlueprint,
    saveMixReport: mocks.saveMixReport,
  };
});

const user = {
  _id: { toString: () => '507f1f77bcf86cd799439011' },
  email: 'producer@example.com',
  name: 'Producer',
  avatarUrl: null,
  preferences: { theme: 'system' },
};

const identity = {
  googleId: 'google-sub-123',
  email: 'producer@example.com',
  emailVerified: true,
  name: 'Producer',
};

const blueprint = {
  title: 'Rain alley',
  summary: 'A narrow alley under neon rain.',
  bpm: 72,
  key: 'D minor',
  mood: { primary: 'tense', secondary: ['hopeful'], energyCurve: [{ position: 0, energy: 0.2 }] },
  arrangement: [
    { name: 'Establish', bars: 8, energy: 0.2, elements: ['drone'], notes: null },
  ],
  layers: [
    { name: 'Bed', role: 'foundation', description: 'Low drone', frequencyFocus: '40-120 Hz' },
  ],
  foleyAndAmbience: ['rain on metal'],
  automation: ['open filter'],
  transitions: ['reverse swell'],
  productionNotes: ['keep it sparse'],
  flStudioChain: [
    {
      plugin: 'Fruity Parametric EQ 2',
      purpose: 'remove rumble',
      placement: 'first',
      startingPoint: 'high-pass at 30 Hz',
    },
  ],
  assumptions: ['tempo is a suggestion'],
  uncertainty: ['layer count may vary'],
};

const report = {
  measuredFacts: ['Duration 12.0 s, stereo.'],
  hypotheses: ['Low band dominance suggests a bass-heavy bed.'],
  recommendations: ['High-pass at 30 Hz with Fruity Parametric EQ 2.'],
  limitations: ['RMS is not LUFS.'],
};

async function signedInAgent() {
  const agent = request.agent(buildApp());
  await agent.post('/api/v1/auth/google').send({ credential: 'valid-token' });
  return agent;
}

describe('AI endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyGoogleIdToken.mockResolvedValue(identity);
    mocks.upsertGoogleUser.mockResolvedValue(user);
    mocks.findUserById.mockResolvedValue(user);
    mocks.requestStructuredOutput.mockResolvedValue({
      data: blueprint,
      model: 'test-model',
      provider: 'adaption',
    });
  });

  it('requires a session', async () => {
    const response = await request(buildApp())
      .post('/api/v1/ai/blueprint')
      .send({ sceneDescription: 'A lighthouse in a storm at dawn.' });

    expect(response.status).toBe(401);
    expect(mocks.requestStructuredOutput).not.toHaveBeenCalled();
  });

  it('validates the request body before calling the provider', async () => {
    const agent = await signedInAgent();
    const response = await agent.post('/api/v1/ai/blueprint').send({ sceneDescription: 'short' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(mocks.requestStructuredOutput).not.toHaveBeenCalled();
  });

  it('returns a validated blueprint without pretending to persist it', async () => {
    const agent = await signedInAgent();
    const response = await agent
      .post('/api/v1/ai/blueprint')
      .send({ sceneDescription: 'A lighthouse in a storm, rain on glass, dawn approaching.' });

    expect(response.status).toBe(200);
    expect(response.body.blueprint).toMatchObject({ title: 'Rain alley' });
    expect(response.body.persisted).toBe(false);
    expect(response.body.project).toBeNull();
    expect(mocks.saveBlueprint).not.toHaveBeenCalled();
  });

  it('persists the blueprint when an owned project id is supplied', async () => {
    mocks.saveBlueprint.mockResolvedValue({
      _id: { toString: () => '507f1f77bcf86cd799439013' },
      name: 'Rain alley',
      sceneBrief: '',
      blueprint,
      audioAnalysis: null,
      mixReport: null,
      schemaVersion: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const agent = await signedInAgent();
    const response = await agent.post('/api/v1/ai/blueprint').send({
      sceneDescription: 'A lighthouse in a storm, rain on glass, dawn approaching.',
      projectId: '507f1f77bcf86cd799439013',
    });

    expect(response.status).toBe(200);
    expect(response.body.persisted).toBe(true);
    expect(response.body.project.id).toBe('507f1f77bcf86cd799439013');
    expect(mocks.saveBlueprint).toHaveBeenCalledWith(
      '507f1f77bcf86cd799439011',
      '507f1f77bcf86cd799439013',
      blueprint,
    );
  });

  it('returns a qualified mix report from numeric metrics', async () => {
    mocks.requestStructuredOutput.mockResolvedValue({
      data: report,
      model: 'test-model',
      provider: 'openrouter-key-1',
    });

    const agent = await signedInAgent();
    const response = await agent.post('/api/v1/ai/mix-report').send({
      objective: 'Streaming master',
      metrics: {
        channels: 2,
        durationSeconds: 12,
        samplePeakDbfs: -1.2,
        rmsDbfs: -16.4,
        crestFactorDb: 15.2,
        bandEnergy: { low: 0.5, mid: 0.3, high: 0.2 },
        stereoCorrelation: 0.4,
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.report).toMatchObject({ measuredFacts: report.measuredFacts });
    expect(response.body.persisted).toBe(false);
  });

  it('rejects metrics that are not numeric valid ranges', async () => {
    const agent = await signedInAgent();
    const response = await agent.post('/api/v1/ai/mix-report').send({
      objective: 'Streaming master',
      metrics: { channels: 3, durationSeconds: -1 },
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('names the failing field in the validation message', async () => {
    const agent = await signedInAgent();
    const response = await agent.post('/api/v1/ai/mix-report').send({
      objective: 'Streaming master',
      metrics: { channels: 2, durationSeconds: 4 },
    });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toContain('metrics.');
    expect(response.body.error.details.issues.length).toBeGreaterThan(0);
  });

  it('accepts decoded sample peaks above full scale', async () => {
    mocks.requestStructuredOutput.mockResolvedValue({
      data: report,
      model: 'test-model',
      provider: 'adaption',
    });

    const agent = await signedInAgent();
    const response = await agent.post('/api/v1/ai/mix-report').send({
      objective: 'Streaming master',
      metrics: {
        channels: 2,
        durationSeconds: 12.5,
        samplePeakDbfs: 0.4,
        rmsDbfs: -14.2,
        crestFactorDb: 14.6,
        bandEnergy: { low: 0.4, mid: 0.35, high: 0.25 },
        stereoCorrelation: 0.82,
      },
    });

    expect(response.status).toBe(200);
    expect(response.body.report).toMatchObject({ measuredFacts: report.measuredFacts });
  });

  it('surfaces provider errors without fabricating output', async () => {
    mocks.requestStructuredOutput.mockRejectedValue(
      new AppError(502, 'AI_UNAVAILABLE', 'The AI provider could not complete the request.'),
    );

    const agent = await signedInAgent();
    const response = await agent
      .post('/api/v1/ai/blueprint')
      .send({ sceneDescription: 'A lighthouse in a storm, rain on glass, dawn approaching.' });

    expect(response.status).toBe(502);
    expect(response.body.blueprint).toBeUndefined();
  });
});
