import type { ZodType, infer as ZodInfer } from 'zod';
import { AppError } from '../lib/errors';

export async function readJson<T extends ZodType>(
  request: Request,
  schema: T,
): Promise<ZodInfer<T>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new AppError(400, 'VALIDATION_ERROR', 'Request validation failed. body: Expected JSON.');
  }

  return schema.parse(body) as ZodInfer<T>;
}

export function readParams<T extends ZodType>(params: unknown, schema: T): ZodInfer<T> {
  return schema.parse(params) as ZodInfer<T>;
}
