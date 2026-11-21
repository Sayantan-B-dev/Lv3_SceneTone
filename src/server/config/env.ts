import { z } from 'zod';

const emptyToUndefined = (value: unknown): unknown => (value === '' ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ORIGIN: z.string().url(),
  MONGODB_URI: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: optionalString,
  GOOGLE_CALLBACK_URL: optionalUrl,
  ADAPTION_API_KEY: optionalString,
  ADAPTION_BASE_URL: optionalUrl,
  ADAPTION_MODEL: optionalString,
  OPENROUTER_BASE_URL: optionalUrl,
  OPENROUTER_MODEL: optionalString,
  OPENROUTER_API_KEY_1: optionalString,
  OPENROUTER_API_KEY_2: optionalString,
  OPENROUTER_API_KEY_3: optionalString,
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) {
    return cached;
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment configuration: ${JSON.stringify(fields)}`);
  }

  cached = parsed.data;
  return cached;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const isProduction = nodeEnv === 'production';
export const isDevelopment = nodeEnv === 'development';
export const isTest = nodeEnv === 'test';
