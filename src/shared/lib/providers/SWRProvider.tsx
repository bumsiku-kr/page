'use client';

import React from 'react';
import { SWRConfig } from 'swr';
import { swrConfig } from '@/shared/lib/swr';

interface SWRProviderProps {
  children: React.ReactNode;
}

/**
 * SWR Provider component
 * Wraps the application with global SWR configuration
 * - Automatic caching and deduplication
 * - Exponential backoff retry logic
 * - Keep previous data while revalidating
 */
export function SWRProvider({ children }: SWRProviderProps) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
