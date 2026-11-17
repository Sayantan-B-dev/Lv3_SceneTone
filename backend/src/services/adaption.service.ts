import type { ZodTypeAny } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

export interface StructuredRequest {
  system: string;
  user: string;
  schema: ZodTypeAny;
  temperature?: number;
}

export interface StructuredResult<T> {
  data: T;
  model: string;
  provider: string;
}

export interface TextRequest {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

export interface TextResult {
  text: string;
  model: string;
  provider: string;
}

interface ProviderTarget {
  id: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  headers?: Record<string, string>;
}

const RETRYABLE_CODES = new Set([
  'AI_TIMEOUT',
  'AI_UNAVAILABLE',
  'AI_RATE_LIMITED',
  'AI_AUTH_FAILED',
  'AI_INVALID_RESPONSE',
  'AI_INVALID_OUTPUT',
]);

function openRouterTargets(): ProviderTarget[] {
  const baseUrl = (env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1').replace(/\/$/u, '');
  const keys = [env.OPENROUTER_API_KEY_1, env.OPENROUTER_API_KEY_2, env.OPENROUTER_API_KEY_3]
    .map((key) => key?.trim())
    .filter((key): key is string => Boolean(key));

  return keys.map((apiKey, index) => ({
    id: `openrouter-key-${index + 1}`,
    baseUrl,
    apiKey,
    model: env.OPENROUTER_MODEL ?? 'openrouter/auto',
    headers: {
      'HTTP-Referer': env.FRONTEND_ORIGIN,
      'X-Title': 'SceneTone',
    },
  }));
}

function providerTargets(): ProviderTarget[] {
  const targets: ProviderTarget[] = [];

  if (env.ADAPTION_API_KEY && env.ADAPTION_BASE_URL && env.ADAPTION_MODEL) {
    targets.push({
      id: 'adaption',
      baseUrl: env.ADAPTION_BASE_URL.replace(/\/$/u, ''),
      apiKey: env.ADAPTION_API_KEY,
      model: env.ADAPTION_MODEL,
    });
  }

  return [...targets, ...openRouterTargets()];
}

export function isAiConfigured(): boolean {
  return providerTargets().length > 0;
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  return fenced ? fenced[1]!.trim() : trimmed;
}

function extractJsonObject(text: string): unknown {
  const candidate = stripCodeFence(text);
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');

  if (start === -1 || end <= start) {
    return undefined;
  }

  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return undefined;
  }
}

function providerError(status: number): AppError {
  if (status === 429) {
    return new AppError(
      429,
      'AI_RATE_LIMITED',
      'The AI provider is rate limiting requests. Try again in a moment.',
    );
  }

  if (status === 401 || status === 403) {
    return new AppError(
      503,
      'AI_AUTH_FAILED',
      'The AI provider rejected the server credentials. Check the server configuration.',
    );
  }

  return new AppError(
    502,
    'AI_UNAVAILABLE',
    'The AI provider could not complete the request. Try again later.',
  );
}

async function requestCompletion(
  target: ProviderTarget,
  { system, user, temperature = 0.6, maxTokens }: TextRequest,
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.AI_REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${target.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${target.apiKey}`,
        ...target.headers,
      },
      body: JSON.stringify({
        model: target.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
        ...(maxTokens ? { max_tokens: maxTokens } : {}),
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new AppError(504, 'AI_TIMEOUT', 'The AI provider did not respond in time. Try again.');
    }

    logger.warn({ err: error, provider: target.id }, 'AI provider request failed');
    throw new AppError(502, 'AI_UNAVAILABLE', 'The AI provider could not be reached.');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    logger.warn(
      { status: response.status, body: body.slice(0, 500), provider: target.id },
      'AI provider returned an error status',
    );
    throw providerError(response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AppError(502, 'AI_INVALID_RESPONSE', 'The AI provider returned an unreadable response.');
  }

  const content = (
    payload as { choices?: { message?: { content?: unknown } }[] } | null
  )?.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new AppError(502, 'AI_INVALID_RESPONSE', 'The AI provider returned an empty response.');
  }

  return content.trim();
}

async function withProviderFallback<T>(
  attempt: (target: ProviderTarget) => Promise<T>,
): Promise<T> {
  const targets = providerTargets();

  if (targets.length === 0) {
    throw new AppError(503, 'AI_NOT_CONFIGURED', 'AI generation is not configured on this server.');
  }

  let lastError: AppError | null = null;

  for (const target of targets) {
    try {
      return await attempt(target);
    } catch (error) {
      if (!(error instanceof AppError) || !RETRYABLE_CODES.has(error.code)) {
        throw error;
      }

      lastError = error;
      logger.warn(
        { provider: target.id, code: error.code },
        'AI provider attempt failed, trying the next configured provider',
      );
    }
  }

  throw (
    lastError ??
    new AppError(502, 'AI_UNAVAILABLE', 'The AI provider could not complete the request.')
  );
}

async function requestStructuredFromProvider<T>(
  target: ProviderTarget,
  options: StructuredRequest,
): Promise<StructuredResult<T>> {
  const content = await requestCompletion(target, options);
  const parsed = extractJsonObject(content);
  const result = options.schema.safeParse(parsed);

  if (!result.success) {
    logger.warn(
      { issues: result.error.issues.slice(0, 5), provider: target.id },
      'AI provider returned output that failed schema validation',
    );
    throw new AppError(
      502,
      'AI_INVALID_OUTPUT',
      'The AI provider returned output that did not match the expected structure.',
    );
  }

  return { data: result.data as T, model: target.model, provider: target.id };
}

export async function requestStructuredOutput<T>(
  options: StructuredRequest,
): Promise<StructuredResult<T>> {
  return withProviderFallback((target) => requestStructuredFromProvider<T>(target, options));
}

export async function requestText(options: TextRequest): Promise<TextResult> {
  return withProviderFallback(async (target) => ({
    text: await requestCompletion(target, options),
    model: target.model,
    provider: target.id,
  }));
}
