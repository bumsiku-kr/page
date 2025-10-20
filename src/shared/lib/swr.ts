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
};
