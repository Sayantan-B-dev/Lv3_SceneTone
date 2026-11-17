import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';

const mocks = vi.hoisted(() => ({
  verifyGoogleIdToken: vi.fn(),
  upsertGoogleUser: vi.fn(),
  findUserById: vi.fn(),
}));

vi.mock('../src/services/google.js', () => ({
  verifyGoogleIdToken: mocks.verifyGoogleIdToken,
}));

vi.mock('../src/services/users.service.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/services/users.service.js')>();
  return {
    ...actual,
    upsertGoogleUser: mocks.upsertGoogleUser,
    findUserById: mocks.findUserById,
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

describe('auth endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyGoogleIdToken.mockResolvedValue(identity);
    mocks.upsertGoogleUser.mockResolvedValue(user);
    mocks.findUserById.mockResolvedValue(user);
  });

  it('rejects a credential the verifier cannot validate', async () => {
    mocks.verifyGoogleIdToken.mockRejectedValue(new Error('invalid signature'));

    const response = await request(buildApp())
      .post('/api/v1/auth/google')
      .send({ credential: 'not-a-token' });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_GOOGLE_TOKEN');
    expect(mocks.upsertGoogleUser).not.toHaveBeenCalled();
  });

  it('rejects a missing credential before verification', async () => {
    const response = await request(buildApp()).post('/api/v1/auth/google').send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(mocks.verifyGoogleIdToken).not.toHaveBeenCalled();
  });

  it('creates a session, serves the current user and logs out', async () => {
    const agent = request.agent(buildApp());

    const signIn = await agent
      .post('/api/v1/auth/google')
      .send({ credential: 'valid-token' });

    expect(signIn.status).toBe(200);
    expect(signIn.body.user).toMatchObject({
      id: '507f1f77bcf86cd799439011',
      email: 'producer@example.com',
      preferences: { theme: 'system' },
    });
    expect(signIn.headers['set-cookie']?.[0]).toContain('scenetone.sid=');
    expect(mocks.verifyGoogleIdToken).toHaveBeenCalledWith('valid-token');

    const me = await agent.get('/api/v1/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('producer@example.com');

    const logout = await agent.post('/api/v1/auth/logout');
    expect(logout.status).toBe(204);

    const afterLogout = await agent.get('/api/v1/auth/me');
    expect(afterLogout.status).toBe(401);
    expect(afterLogout.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects unauthenticated protected routes with 401', async () => {
    const response = await request(buildApp()).get('/api/v1/projects');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('invalidates a session whose user no longer exists', async () => {
    const agent = request.agent(buildApp());
    await agent.post('/api/v1/auth/google').send({ credential: 'valid-token' });
    mocks.findUserById.mockResolvedValue(null);

    const response = await agent.get('/api/v1/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('validates project ids and bodies before reaching persistence', async () => {
    const agent = request.agent(buildApp());
    await agent.post('/api/v1/auth/google').send({ credential: 'valid-token' });

    const badId = await agent.get('/api/v1/projects/not-an-id');
    expect(badId.status).toBe(400);
    expect(badId.body.error.code).toBe('VALIDATION_ERROR');

    const badBody = await agent.post('/api/v1/projects').send({ name: '  ' });
    expect(badBody.status).toBe(400);
    expect(badBody.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects unsafe cross-origin requests', async () => {
    const response = await request(buildApp())
      .post('/api/v1/auth/google')
      .set('Origin', 'https://evil.example')
      .send({ credential: 'valid-token' });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('CSRF_ORIGIN_REJECTED');
  });
});
