import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    const issues = error.issues.map(
      (issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`,
    );

    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: `Request validation failed. ${issues.slice(0, 3).join('; ')}`,
          details: { ...error.flatten(), issues },
        },
      },
      { status: 400 },
    );
  }

  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error({ err: error }, 'request failed');
    }

    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details === undefined ? {} : { details: error.details }),
        },
      },
      { status: error.statusCode },
    );
  }

  logger.error({ err: error }, 'unhandled request error');
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred.',
      },
    },
    { status: 500 },
  );
}

export async function handleRoute(handler: () => Promise<Response>): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    return errorResponse(error);
  }
}
