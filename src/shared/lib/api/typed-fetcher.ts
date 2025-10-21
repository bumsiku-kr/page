import { z } from 'zod';
import { APIClient } from '@/lib/api/client';
import { AxiosRequestConfig } from 'axios';

/**
 * Creates a type-safe fetcher with runtime validation using Zod
 *
 * Benefits:
 * - Compile-time type safety (TypeScript)
 * - Runtime type validation (Zod)
 * - Catches API contract violations early
 * - Better error messages for debugging
 *
 * @param schema - Zod schema for response validation
 * @returns Typed fetcher function
 *
 * @example
 * ```typescript
 * const PostSchema = z.object({ id: z.number(), title: z.string() });
 * const fetchPost = createTypedFetcher(PostSchema);
 * const post = await fetchPost('/posts/1'); // Type-safe and validated
 * ```
 */
export function createTypedFetcher<T extends z.ZodTypeAny>(schema: T) {
  return async (config: AxiosRequestConfig): Promise<z.infer<T>> => {
    const client = APIClient.getInstance();
    const response = await client.request<unknown>(config);

    // Runtime validation with Zod
    try {
      return schema.parse(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('API Response Validation Error:', {
          url: config.url,
          method: config.method,
          errors: error.errors,
        });
        throw new Error(
          `API response validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
        );
      }
      throw error;
    }
  };
}

/**
 * Creates a SWR-compatible fetcher with Zod validation
 *
 * Handles both string keys and tuple keys for SWR
 *
 * @param schema - Zod schema for response validation
 * @param method - HTTP method (default: 'GET')
 * @returns SWR fetcher function
 *
 * @example
 * ```typescript
 * const fetcher = createSWRFetcher(PostListSchema);
 * const { data } = useSWR(['/posts', page, size], fetcher);
 * ```
 */
export function createSWRFetcher<T extends z.ZodTypeAny>(
  schema: T,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
) {
  const typedFetcher = createTypedFetcher(schema);

  return async (key: string | readonly unknown[]): Promise<z.infer<T>> => {
    // Extract URL from SWR key (can be string or [url, ...params] tuple)
    const url = Array.isArray(key) ? String(key[0]) : (key as string);

    return typedFetcher({
      url,
      method,
    });
  };
}

/**
 * Safe parse wrapper for optional runtime validation
 * Returns validation result without throwing
 *
 * @param schema - Zod schema
 * @param data - Data to validate
 * @returns Zod safe parse result
 */
export function safeValidate<T extends z.ZodTypeAny>(schema: T, data: unknown) {
  return schema.safeParse(data);
}
