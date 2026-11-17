import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
}));

vi.mock('google-auth-library', () => ({
  OAuth2Client: class {
    verifyIdToken = mocks.verifyIdToken;
  },
}));

const { verifyGoogleIdToken } = await import('../src/services/google.js');

describe('Google ID token verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifies against the configured audience and maps verified claims', async () => {
    mocks.verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-sub-123',
        email: 'producer@example.com',
        email_verified: true,
        name: 'Producer',
        picture: 'https://example.com/avatar.png',
      }),
    });

    const identity = await verifyGoogleIdToken('id-token');

    expect(mocks.verifyIdToken).toHaveBeenCalledWith({
      idToken: 'id-token',
      audience: 'test-client-id.apps.googleusercontent.com',
    });
    expect(identity).toEqual({
      googleId: 'google-sub-123',
      email: 'producer@example.com',
      emailVerified: true,
      name: 'Producer',
      avatarUrl: 'https://example.com/avatar.png',
    });
  });

  it('rejects a payload without a stable subject', async () => {
    mocks.verifyIdToken.mockResolvedValue({ getPayload: () => ({ email: 'x@example.com' }) });

    await expect(verifyGoogleIdToken('id-token')).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_GOOGLE_TOKEN',
    });
  });

  it('propagates verifier failures so callers fail closed', async () => {
    mocks.verifyIdToken.mockRejectedValue(new Error('signature mismatch'));

    await expect(verifyGoogleIdToken('id-token')).rejects.toThrow('signature mismatch');
  });
});
