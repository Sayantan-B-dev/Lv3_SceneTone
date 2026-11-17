import type { z } from 'zod';
import type { Env } from './types.js';

export class WorkerError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'WorkerError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ProviderTarget {
  id: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  headers?: Record<string, string>;
}

export interface StructuredOptions<T extends z.ZodTypeAny> {
  system: string;
  user: string;
  schema: T;
  temperature?: number;
}

export interface TextOptions {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}

export interface Completion<T> {
  data: T;
  model: string;
  provider: string;
}

const RETRYABLE_CODES = new Set([
  'AI_TIMEOUT',
  'AI_UNAVAILABLE',
  'AI_RATE_LIMITED',
  'AI_AUTH_FAILED',
  'AI_INVALID_RESPONSE',
  'AI_INVALID_OUTPUT',
]);

export function isAiConfigured(env: Env): boolean {
  return providerTargets(env).length > 0;
}

function providerTargets(env: Env): ProviderTarget[] {
  const targets: ProviderTarget[] = [];

  if (env.ADAPTION_API_KEY && env.ADAPTION_BASE_URL && env.ADAPTION_MODEL) {
    targets.push({
      id: 'adaption',
      baseUrl: env.ADAPTION_BASE_URL.replace(/\/$/u, ''),
      apiKey: env.ADAPTION_API_KEY,
      model: env.ADAPTION_MODEL,
    });
  }

  const baseUrl = (env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1').replace(/\/$/u, '');
  const keys = [env.OPENROUTER_API_KEY_1, env.OPENROUTER_API_KEY_2, env.OPENROUTER_API_KEY_3]
    .map((key) => key?.trim())
    .filter((key): key is string => Boolean(key));

  for (const [index, apiKey] of keys.entries()) {
    targets.push({
      id: `openrouter-key-${index + 1}`,
      baseUrl,
      apiKey,
      model: env.OPENROUTER_MODEL ?? 'openrouter/auto',
      headers: {
        ...(env.FRONTEND_ORIGIN ? { 'HTTP-Referer': env.FRONTEND_ORIGIN } : {}),
        'X-Title': 'SceneTone',
      },
    });
  }

  return targets;
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

function providerError(status: number): WorkerError {
  if (status === 429) {
    return new WorkerError(429, 'AI_RATE_LIMITED', 'The AI provider is rate limiting requests. Try again in a moment.');
  }

  if (status === 401 || status === 403) {
    return new WorkerError(
      503,
      'AI_AUTH_FAILED',
      'The AI provider rejected the server credentials. Check the Worker secrets.',
    );
  }

  return new WorkerError(
    502,
    'AI_UNAVAILABLE',
    'The AI provider could not complete the request. Try again later.',
  );
}

async function completion(
  env: Env,
  target: ProviderTarget,
  options: TextOptions,
): Promise<string> {
  const timeoutMs = Number(env.AI_REQUEST_TIMEOUT_MS ?? 30_000);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 30_000);

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
          { role: 'system', content: options.system },
          { role: 'user', content: options.user },
        ],
        temperature: options.temperature ?? 0.6,
        ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new WorkerError(504, 'AI_TIMEOUT', 'The AI provider did not respond in time. Try again.');
    }

    console.warn('AI provider request failed', target.id, error instanceof Error ? error.message : error);
    throw new WorkerError(502, 'AI_UNAVAILABLE', 'The AI provider could not be reached.');
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    console.warn('AI provider error status', response.status, target.id);
    throw providerError(response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new WorkerError(502, 'AI_INVALID_RESPONSE', 'The AI provider returned an unreadable response.');
  }

  const content = (payload as { choices?: { message?: { content?: unknown } }[] } | null)?.choices?.[0]
    ?.message?.content;

  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new WorkerError(502, 'AI_INVALID_RESPONSE', 'The AI provider returned an empty response.');
  }

  return content.trim();
}

async function withFallback<T>(
  env: Env,
  attempt: (target: ProviderTarget) => Promise<T>,
): Promise<T> {
  const targets = providerTargets(env);

  if (targets.length === 0) {
    throw new WorkerError(503, 'AI_NOT_CONFIGURED', 'AI generation is not configured on this Worker.');
  }

  let lastError: WorkerError | null = null;

  for (const target of targets) {
    try {
      return await attempt(target);
    } catch (error) {
      if (!(error instanceof WorkerError) || !RETRYABLE_CODES.has(error.code)) {
        throw error;
      }

      lastError = error;
      console.warn('AI provider attempt failed, trying next provider', target.id, error.code);
    }
  }

  throw lastError ?? new WorkerError(502, 'AI_UNAVAILABLE', 'The AI provider could not complete the request.');
}

export async function requestStructured<T extends z.ZodTypeAny>(
  env: Env,
  options: StructuredOptions<T>,
): Promise<Completion<z.infer<T>>> {
  return withFallback(env, async (target) => {
    const content = await completion(env, target, options);
    const result = options.schema.safeParse(extractJsonObject(content));

    if (!result.success) {
      console.warn('AI provider returned invalid output', target.id, result.error.issues.slice(0, 5));
      throw new WorkerError(
        502,
        'AI_INVALID_OUTPUT',
        'The AI provider returned output that did not match the expected structure.',
      );
    }

    return { data: result.data as z.infer<T>, model: target.model, provider: target.id };
  });
}

export async function requestText(
  env: Env,
  options: TextOptions,
): Promise<{ text: string; model: string; provider: string }> {
  return withFallback(env, async (target) => ({
    text: await completion(env, target, options),
    model: target.model,
    provider: target.id,
  }));
}
