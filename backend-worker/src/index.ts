import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import type { ZodTypeAny, infer as ZodInfer } from 'zod';
import { isAiConfigured, requestStructured, requestText, WorkerError } from './ai.js';
import { buildBlueprintPrompt, buildGuidePrompt, buildMixReportPrompt } from './prompts.js';
import {
  blueprintRequestSchema,
  guideRequestSchema,
  mixReportRequestSchema,
  mixReportSchema,
  soundscapeBlueprintSchema,
  type BlueprintRequest,
  type GuideRequest,
  type MixReportRequest,
} from './schemas.js';
import type { Bindings } from './types.js';

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', secureHeaders());
app.use(
  '/api/*',
  cors({
    origin: (origin, c) => (origin === c.env.FRONTEND_ORIGIN ? origin : null),
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    credentials: true,
    maxAge: 86_400,
  }),
);

app.get('/api/v1/health', (c) =>
  c.json({
    status: 'ok',
    runtime: 'cloudflare-worker',
    aiConfigured: isAiConfigured(c.env),
    time: new Date().toISOString(),
  }),
);

app.post('/api/v1/ai/blueprint', async (c) => {
  const input = await readBody(c, blueprintRequestSchema);
  const result = await requestStructured(c.env, {
    ...buildBlueprintPrompt(input),
    schema: soundscapeBlueprintSchema,
  });

  return c.json({
    blueprint: result.data,
    model: result.model,
    provider: result.provider,
    project: null,
    persisted: false,
  });
});

app.post('/api/v1/ai/mix-report', async (c) => {
  const input = await readBody(c, mixReportRequestSchema);
  const result = await requestStructured(c.env, {
    ...buildMixReportPrompt(input),
    schema: mixReportSchema,
    temperature: 0.4,
  });

  return c.json({
    report: result.data,
    model: result.model,
    provider: result.provider,
    project: null,
    persisted: false,
  });
});

app.post('/api/v1/ai/guide', async (c) => {
  const input = await readBody(c, guideRequestSchema);
  const result = await requestText(c.env, {
    ...buildGuidePrompt(input),
    temperature: 0.75,
    maxTokens: 350,
  });

  return c.json({ answer: result.text, model: result.model, provider: result.provider });
});

// Auth and project persistence stay on the Express backend in V1.
app.all('/api/v1/auth/*', (c) =>
  c.json(
    {
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Sign-in is handled by the Express backend, not this Worker.',
      },
    },
    501,
  ),
);

app.all('/api/v1/projects/*', (c) =>
  c.json(
    {
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'Projects are stored by the Express backend, not this Worker.',
      },
    },
    501,
  ),
);

app.notFound((c) =>
  c.json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } }, 404),
);

app.onError((error, c) => {
  if (error instanceof WorkerError) {
    return c.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details === undefined ? {} : { details: error.details }),
        },
      },
      error.status as 400,
    );
  }

  console.error('Unhandled Worker error', error);
  return c.json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } }, 500);
});

async function readBody<T extends ZodTypeAny>(
  c: Context<{ Bindings: Bindings }>,
  schema: T,
): Promise<ZodInfer<T>> {
  let body: unknown;

  try {
    body = await c.req.json();
  } catch {
    throw new WorkerError(400, 'VALIDATION_ERROR', 'Request validation failed. body: Expected JSON.');
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`);
    throw new WorkerError(
      400,
      'VALIDATION_ERROR',
      `Request validation failed. ${issues.slice(0, 3).join('; ')}`,
      { issues },
    );
  }

  return result.data as ZodInfer<T>;
}

export type { BlueprintRequest, GuideRequest, MixReportRequest };

export default app;
