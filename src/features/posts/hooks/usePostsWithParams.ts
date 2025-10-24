import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { usePostsQuery, usePostsByTagQuery } from './usePostsQuery';
import type { PostListResponse, SortOption } from '@/types';

/**
 * Hook that integrates URL search params with SWR posts query
 * Replaces manual state management with declarative SWR approach
 *
 * Benefits:
 * - Automatic caching and revalidation
 * - Deduplication of requests
 * - Optimistic updates support
 * - Type-safe URL params parsing
 *
 * @param initialData - SSR data for hydration (optional)
 */
export function usePostsWithParams(initialData?: PostListResponse) {
  const searchParams = useSearchParams();

  // Parse URL params with type safety
  const params = useMemo(() => {
    const pageParam = searchParams.get('page');
    const tagParam = searchParams.get('tag');
    const sortParam = searchParams.get('sort');

    return {
      page: pageParam ? parseInt(pageParam, 10) : 1,
      tag: tagParam || undefined,
      sort: (sortParam as SortOption) || 'views,desc',
    };
  }, [searchParams]);

  // Always call both hooks to comply with Rules of Hooks
  // The unused one will be null-keyed and won't make requests
  const byTagResult = usePostsByTagQuery(params.tag || '', params.page - 1, 5, params.sort);
  const allPostsResult = usePostsQuery(params.page - 1, 5, params.sort);

  // Select the appropriate result based on tag presence
  const swrResult = params.tag ? byTagResult : allPostsResult;

  return {
    // Use SWR data, fallback to SSR initial data
    posts: swrResult.data ?? initialData,
    isLoading: swrResult.isLoading,
    error: swrResult.error,
    mutate: swrResult.mutate,

    // Expose parsed params for components
    page: params.page,
    tag: params.tag,
    sort: params.sort,
  };
}
