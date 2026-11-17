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

export function isAiConfigured(): boolean {
  return Boolean(env.ADAPTION_API_KEY && env.ADAPTION_BASE_URL && env.ADAPTION_MODEL);
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

export async function requestStructuredOutput<T>({
  system,
  user,
  schema,
  temperature = 0.6,
}: StructuredRequest): Promise<T> {
  if (!isAiConfigured()) {
    throw new AppError(503, 'AI_NOT_CONFIGURED', 'AI generation is not configured on this server.');
  }

  const baseUrl = env.ADAPTION_BASE_URL!.replace(/\/$/u, '');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.AI_REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.ADAPTION_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.ADAPTION_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature,
      }),
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new AppError(
        504,
        'AI_TIMEOUT',
        'The AI provider did not respond in time. Try again.',
      );
    }

    logger.warn({ err: error }, 'AI provider request failed');
    throw new AppError(502, 'AI_UNAVAILABLE', 'The AI provider could not be reached.');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    logger.warn(
      { status: response.status, body: body.slice(0, 500) },
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

  const parsed = extractJsonObject(content);
  const result = schema.safeParse(parsed);

  if (!result.success) {
    logger.warn(
      { issues: result.error.issues.slice(0, 5) },
      'AI provider returned output that failed schema validation',
    );
    throw new AppError(
      502,
      'AI_INVALID_OUTPUT',
      'The AI provider returned output that did not match the expected structure.',
    );
  }

  return result.data as T;
}
