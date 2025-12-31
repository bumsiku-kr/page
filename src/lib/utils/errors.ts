import { AxiosError } from 'axios';

/**
 * API error response type
 */
export interface APIErrorResponse {
  error?: string | { message: string };
  message?: string;
}

/**
 * Type guard for Axios errors
 */
export function isAxiosError<T = unknown>(error: unknown): error is AxiosError<T> {
  return (
    error !== null &&
    typeof error === 'object' &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}

/**
 * Type guard for API errors (Axios with response)
 */
export function isAPIError(error: unknown): error is AxiosError<APIErrorResponse> {
  return isAxiosError<APIErrorResponse>(error) && error.response !== undefined;
}

/**
 * Type guard for generic Error
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Extract error message safely
 */
export function getErrorMessage(error: unknown): string {
  if (isAPIError(error)) {
    const data = error.response?.data;

    if (typeof data?.error === 'string') {
      return data.error;
    }

    if (typeof data?.error === 'object' && data.error !== null && 'message' in data.error) {
      return String(data.error.message);
    }

    if (typeof data?.message === 'string') {
      return data.message;
    }

    return error.message || '알 수 없는 오류가 발생했습니다.';
  }

  if (isError(error)) {
    return error.message || '알 수 없는 오류가 발생했습니다.';
  }

  if (typeof error === 'string') {
    return error;
  }

  return '알 수 없는 오류가 발생했습니다.';
}

/**
 * Extract HTTP status code
 */
export function getStatusCode(error: unknown): number | null {
  if (isAPIError(error)) {
    return error.response?.status ?? null;
  }
  return null;
}

/**
 * Check if error is 404 Not Found
 */
export function isNotFoundError(error: unknown): boolean {
  return getStatusCode(error) === 404;
}

/**
 * Check if error is client error (400-499)
 */
export function isClientError(error: unknown): boolean {
  const status = getStatusCode(error);
  return status !== null && status >= 400 && status < 500;
}

/**
 * Check if error is server error (500-599)
 */
export function isServerError(error: unknown): boolean {
  const status = getStatusCode(error);
  return status !== null && status >= 500;
}

/**
 * Check if error is unauthorized (401)
 */
export function isUnauthorizedError(error: unknown): boolean {
  return getStatusCode(error) === 401;
}

/**
 * Check if error is forbidden (403)
 */
export function isForbiddenError(error: unknown): boolean {
  return getStatusCode(error) === 403;
}
