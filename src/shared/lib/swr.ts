import { SWRConfiguration } from 'swr';

/**
 * Global SWR configuration
 * Provides consistent data fetching behavior across the application
 */
export const swrConfig: SWRConfiguration = {
  // Disable automatic revalidation on window focus for better UX
  revalidateOnFocus: false,

  // Revalidate when network reconnects
  revalidateOnReconnect: true,

  // Retry on error with exponential backoff
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,

  // Deduplicate requests within 2 seconds
  dedupingInterval: 2000,

  // Keep previous data while revalidating (better UX for lists)
  keepPreviousData: true,

  // Global error handler
  onError: (error, key) => {
    console.error('SWR Error:', key, error);

    // Auto-redirect to login on unauthorized errors
    if (error.message?.includes('unauthorized') || error.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },

  // Custom retry logic with exponential backoff
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Never retry on 404
    if (error.status === 404) return;

    // Never retry on 401 (unauthorized)
    if (error.status === 401) return;

    // Max 5 retries
    if (retryCount >= 5) return;

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    setTimeout(() => revalidate({ retryCount }), Math.pow(2, retryCount) * 1000);
  },
};
