import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { getEnv, isProduction } from '../config/env';
import { connectDatabase } from '../db/connect';
import { SessionModel } from '../models/Session';

export const SESSION_COOKIE_NAME = 'scenetone.sid';
export const OAUTH_STATE_COOKIE_NAME = 'scenetone.oauth';

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const SESSION_TTL_MS = SESSION_TTL_SECONDS * 1000;
const OAUTH_STATE_TTL_SECONDS = 10 * 60;

function sign(value: string): string {
  return createHmac('sha256', getEnv().SESSION_SECRET).update(value).digest('hex');
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function pack(value: string): string {
  return `${value}.${sign(value)}`;
}

function unpack(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }

  const separator = raw.lastIndexOf('.');
  if (separator <= 0) {
    return null;
  }

  const value = raw.slice(0, separator);
  const signature = raw.slice(separator + 1);
  return safeEqual(sign(value), signature) ? value : null;
}

function hashSid(sid: string): string {
  return createHash('sha256').update(sid).digest('hex');
}

export function createOAuthState(): string {
  return randomBytes(32).toString('hex');
}

export function setOAuthStateCookie(response: NextResponse, state: string): void {
  response.cookies.set({
    name: OAUTH_STATE_COOKIE_NAME,
    value: pack(state),
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: OAUTH_STATE_TTL_SECONDS,
  });
}

export function readOAuthStateCookie(request: NextRequest): string | null {
  return unpack(request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value);
}

export function clearOAuthStateCookie(response: NextResponse): void {
  response.cookies.set({
    name: OAUTH_STATE_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export async function createSession(userId: string): Promise<string> {
  await connectDatabase();
  const sid = randomBytes(32).toString('hex');
  await SessionModel.create({
    sidHash: hashSid(sid),
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return sid;
}

export async function getSessionUserId(request: NextRequest): Promise<string | null> {
  const sid = unpack(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!sid) {
    return null;
  }

  await connectDatabase();
  const session = (await SessionModel.findOne({
    sidHash: hashSid(sid),
    expiresAt: { $gt: new Date() },
  }).lean()) as { userId: string } | null;

  return session?.userId ?? null;
}

export async function destroySession(request: NextRequest): Promise<void> {
  const sid = unpack(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!sid) {
    return;
  }

  await connectDatabase();
  await SessionModel.deleteOne({ sidHash: hashSid(sid) }).exec();
}

export function setSessionCookie(response: NextResponse, sid: string): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: pack(sid),
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
