import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { AppError } from '../src/lib/errors.js';

const mocks = vi.hoisted(() => ({
  requestText: vi.fn(),
}));

vi.mock('../src/services/adaption.service.js', () => ({
  requestText: mocks.requestText,
  requestStructuredOutput: vi.fn(),
  isAiConfigured: () => true,
}));

const app = buildApp();

const guide = {
  question: 'What is on this page?',
  pageContext: 'Path: /\nHeadings: SCENE TONE\nButtons and links: Start a blueprint | Analyze a file',
  history: [{ role: 'user' as const, content: 'Hi' }],
};

describe('POST /api/v1/ai/guide', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('answers without a session', async () => {
    mocks.requestText.mockResolvedValue({
      text: 'Probably this is the landing page. I think the buttons start a workflow.',
      model: 'test/router',
      provider: 'openrouter-key-1',
    });

    const response = await request(app).post('/api/v1/ai/guide').send(guide);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      answer: 'Probably this is the landing page. I think the buttons start a workflow.',
      model: 'test/router',
      provider: 'openrouter-key-1',
    });
    expect(mocks.requestText).toHaveBeenCalledTimes(1);
    expect(mocks.requestText.mock.calls[0]?.[0]).toMatchObject({ temperature: 0.75, maxTokens: 350 });
    expect(mocks.requestText.mock.calls[0]?.[0].user).toContain('Path: /');
  });

  it('names the invalid field in the message', async () => {
    const response = await request(app).post('/api/v1/ai/guide').send({ question: '' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.message).toContain('question');
    expect(mocks.requestText).not.toHaveBeenCalled();
  });

  it('returns the provider error status', async () => {
    mocks.requestText.mockRejectedValue(
      new AppError(429, 'AI_RATE_LIMITED', 'The AI provider is rate limiting requests.'),
    );

    const response = await request(app).post('/api/v1/ai/guide').send(guide);

    expect(response.status).toBe(429);
    expect(response.body.error.code).toBe('AI_RATE_LIMITED');
  });
});
