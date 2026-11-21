import { OAuth2Client } from 'google-auth-library';
import { getEnv } from '../config/env';
import { AppError } from '../lib/errors';

let client: OAuth2Client | null = null;

function getClient(): OAuth2Client {
  if (!client) {
    client = new OAuth2Client(getEnv().GOOGLE_CLIENT_ID);
  }
  return client;
}

function requireRedirectConfig(): { callbackUrl: string; clientSecret: string } {
  const env = getEnv();
  if (!env.GOOGLE_CALLBACK_URL || !env.GOOGLE_CLIENT_SECRET) {
    throw new AppError(
      503,
      'GOOGLE_REDIRECT_NOT_CONFIGURED',
      'Redirect-mode Google sign-in is not configured.',
    );
  }

  return { callbackUrl: env.GOOGLE_CALLBACK_URL, clientSecret: env.GOOGLE_CLIENT_SECRET };
}

export function buildGoogleAuthUrl(state: string): string {
  const { callbackUrl } = requireRedirectConfig();
  const params = new URLSearchParams({
    client_id: getEnv().GOOGLE_CLIENT_ID,
    redirect_uri: callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<VerifiedGoogleIdentity> {
  const { callbackUrl, clientSecret } = requireRedirectConfig();
  const redirectClient = new OAuth2Client(getEnv().GOOGLE_CLIENT_ID, clientSecret, callbackUrl);
  const { tokens } = await redirectClient.getToken({ code, redirect_uri: callbackUrl });

  if (!tokens.id_token) {
    throw new AppError(401, 'INVALID_GOOGLE_TOKEN', 'Google credential could not be verified.');
  }

  return verifyGoogleIdToken(tokens.id_token);
}

export interface VerifiedGoogleIdentity {
  googleId: string;
  email: string;
  emailVerified: boolean;
  name: string;
  avatarUrl?: string;
}

export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedGoogleIdentity> {
  const ticket = await getClient().verifyIdToken({
    idToken,
    audience: getEnv().GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new AppError(401, 'INVALID_GOOGLE_TOKEN', 'Google credential could not be verified.');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    emailVerified: payload.email_verified === true,
    name: payload.name ?? payload.email,
    ...(payload.picture ? { avatarUrl: payload.picture } : {}),
  };
}
