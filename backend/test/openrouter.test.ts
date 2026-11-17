import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

process.env.ADAPTION_API_KEY = 'test-adaption-key';
process.env.ADAPTION_BASE_URL = 'https://adaption.test/api/v1';
process.env.ADAPTION_MODEL = 'test-model';
process.env.OPENROUTER_API_KEY_1 = 'openrouter-key-one';
process.env.OPENROUTER_API_KEY_2 = 'openrouter-key-two';
process.env.OPENROUTER_API_KEY_3 = 'openrouter-key-three';
process.env.OPENROUTER_MODEL = 'test/router';
process.env.AI_REQUEST_TIMEOUT_MS = '200';

const { requestStructuredOutput } = await import('../src/services/adaption.service.js');

const schema = z.object({ answer: z.string() });
const request = { system: 'system', user: 'user', schema };

function ok(content = '{"answer":"ok"}') {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function authOf(fetchMock: ReturnType<typeof vi.fn>, index: number): string {
  const init = fetchMock.mock.calls[index]?.[1] as RequestInit | undefined;
  return String((init?.headers as Record<string, string>)?.['Authorization']);
}

describe('AI provider fallback chain', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back from Adaption to the first OpenRouter key', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 502 }))
      .mockResolvedValueOnce(ok());

    vi.stubGlobal('fetch', fetchMock);

    const result = await requestStructuredOutput(request);

    expect(result).toMatchObject({
      data: { answer: 'ok' },
      provider: 'openrouter-key-1',
      model: 'test/router',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(authOf(fetchMock, 0)).toBe('Bearer test-adaption-key');
    expect(authOf(fetchMock, 1)).toBe('Bearer openrouter-key-one');
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      'https://openrouter.ai/api/v1/chat/completions',
    );
  });

  it('rotates to the next key when one is rate limited', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 500 }))
      .mockResolvedValueOnce(new Response('{}', { status: 429 }))
      .mockResolvedValueOnce(ok());

    vi.stubGlobal('fetch', fetchMock);

    const result = await requestStructuredOutput(request);

    expect(result.provider).toBe('openrouter-key-2');
    expect(authOf(fetchMock, 2)).toBe('Bearer openrouter-key-two');
  });

  it('surfaces the last provider error when every key fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 429 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(requestStructuredOutput(request)).rejects.toMatchObject({
      statusCode: 429,
      code: 'AI_RATE_LIMITED',
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('does not retry non-provider failures such as validation', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('not json', { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(requestStructuredOutput(request)).rejects.toMatchObject({
      statusCode: 502,
      code: 'AI_UNAVAILABLE',
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
