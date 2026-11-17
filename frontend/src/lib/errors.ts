import { ApiError } from './api';

interface ErrorDetails {
  issues?: unknown;
  formErrors?: unknown;
  fieldErrors?: unknown;
}

function collectDetails(details: unknown): string[] {
  if (!details || typeof details !== 'object') {
    return [];
  }

  const { issues, formErrors, fieldErrors } = details as ErrorDetails;
  const lines: string[] = [];

  if (Array.isArray(issues)) {
    for (const issue of issues) {
      if (typeof issue === 'string') {
        lines.push(issue);
      }
    }
  }

  if (Array.isArray(formErrors)) {
    for (const error of formErrors) {
      if (typeof error === 'string') {
        lines.push(error);
      }
    }
  }

  if (fieldErrors && typeof fieldErrors === 'object') {
    for (const [field, errors] of Object.entries(fieldErrors as Record<string, unknown>)) {
      if (!Array.isArray(errors)) {
        continue;
      }
      for (const error of errors) {
        if (typeof error === 'string') {
          lines.push(`${field}: ${error}`);
        }
      }
    }
  }

  return Array.from(new Set(lines));
}

/** Turns an API or client error into a sentence that names what actually failed. */
export function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    const details = collectDetails(error.details).filter((line) => !error.message.includes(line));

    if (details.length > 0) {
      return `${error.message} ${details.slice(0, 3).join(' ')}`;
    }

    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Something went wrong and the request did not finish. Try again.';
}
