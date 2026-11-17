import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

process.env.ADAPTION_API_KEY = 'test-adaption-key';
process.env.ADAPTION_BASE_URL = 'https://adaption.test/api/v1';
process.env.ADAPTION_MODEL = 'test-model';
process.env.AI_REQUEST_TIMEOUT_MS = '50';

const { isAiConfigured, requestStructuredOutput } = await import(
  '../src/services/adaption.service.js'
);

const schema = z.object({ answer: z.string() });

function chatResponse(content: string) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

const request = { system: 'system', user: 'user', schema };

describe('Adaption adapter', () => {
  beforeEach(() => {
    expect(isAiConfigured()).toBe(true);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts to the configured chat completions endpoint and parses JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(chatResponse('```json\n{"answer":"ok"}\n```'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(requestStructuredOutput(request)).resolves.toMatchObject({
      data: { answer: 'ok' },
      model: 'test-model',
      provider: 'adaption',
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://adaption.test/api/v1/chat/completions');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer test-adaption-key' });
    expect(JSON.parse(String(init.body))).toMatchObject({ model: 'test-model' });
  });

  it('maps rate limiting to 429 AI_RATE_LIMITED', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 429 })));

    await expect(requestStructuredOutput(request)).rejects.toMatchObject({
      statusCode: 429,
      code: 'AI_RATE_LIMITED',
    });
  });

  it('maps provider outages to 502 AI_UNAVAILABLE', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));
    await expect(requestStructuredOutput(request)).rejects.toMatchObject({
      statusCode: 502,
      code: 'AI_UNAVAILABLE',
    });

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connect ECONNREFUSED')));
    await expect(requestStructuredOutput(request)).rejects.toMatchObject({
      statusCode: 502,
      code: 'AI_UNAVAILABLE',
    });
  });

  it('maps rejected credentials to a configuration error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));

    await expect(requestStructuredOutput(request)).rejects.toMatchObject({
      statusCode: 503,
      code: 'AI_AUTH_FAILED',
    });
  });

  it('rejects malformed and schema-invalid output instead of guessing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(chatResponse('not json at all')));
    await expect(requestStructuredOutput(request)).rejects.toMatchObject({
      statusCode: 502,
      code: 'AI_INVALID_OUTPUT',
    });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(chatResponse('{"unexpected":1}')));
    await expect(requestStructuredOutput(request)).rejects.toMatchObject({
      statusCode: 502,
      code: 'AI_INVALID_OUTPUT',
    });

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(chatResponse('   ')));
    await expect(requestStructuredOutput(request)).rejects.toMatchObject({
      statusCode: 502,
      code: 'AI_INVALID_RESPONSE',
    });
  });

  it('aborts slow requests with 504 AI_TIMEOUT', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) => {
            init.signal?.addEventListener('abort', () => reject(new Error('aborted')));
          }),
      ),
    );

    await expect(requestStructuredOutput(request)).rejects.toMatchObject({
      statusCode: 504,
      code: 'AI_TIMEOUT',
    });
  });

  it('fails closed when configuration is missing', async () => {
    const savedKey = process.env.ADAPTION_API_KEY;
    delete process.env.ADAPTION_API_KEY;
    vi.resetModules();

    try {
      const mod = await import('../src/services/adaption.service.js');
      expect(mod.isAiConfigured()).toBe(false);
      await expect(mod.requestStructuredOutput(request)).rejects.toMatchObject({
        statusCode: 503,
        code: 'AI_NOT_CONFIGURED',
      });
    } finally {
      process.env.ADAPTION_API_KEY = savedKey;
      vi.resetModules();
    }
  });
});
