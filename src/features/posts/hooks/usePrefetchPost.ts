import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { api } from '@/lib/api';

/**
 * Hook for prefetching post data on hover
 *
 * Improves perceived performance by loading data before user clicks
 *
 * Pattern:
 * - Hover on post link → prefetch post data
 * - Click on link → data already in cache, instant render
 *
 * @example
 * ```typescript
 * const prefetch = usePrefetchPost();
 *
 * <Link
 *   href={`/posts/${post.slug}`}
 *   onMouseEnter={() => prefetch(post.slug)}
 * >
 *   {post.title}
 * </Link>
 * ```
 */
export function usePrefetchPost() {
  const { mutate } = useSWRConfig();

  return useCallback(
    (slug: string) => {
      // Prefetch and populate cache without revalidation
      mutate(['post', slug], () => api.posts.getBySlug(slug), {
        revalidate: false,
        populateCache: true,
      });
    },
    [mutate]
  );
}

/**
 * Hook for prefetching posts list on hover over pagination
 *
 * @example
 * ```typescript
 * const prefetchPage = usePrefetchPostsPage();
 *
 * <button onMouseEnter={() => prefetchPage(nextPage)}>
 *   Next Page
 * </button>
 * ```
 */
export function usePrefetchPostsPage() {
  const { mutate } = useSWRConfig();

  return useCallback(
    (page: number, size: number = 5, tag?: string, sort?: string) => {
      const key = tag ? ['posts', 'tag', tag, page, size, sort] : ['posts', page, size, sort];

      mutate(
        key,
        () =>
          tag
            ? api.posts.getList(page, size, tag, sort)
            : api.posts.getList(page, size, undefined, sort),
        {
          revalidate: false,
          populateCache: true,
        }
      );
    },
    [mutate]
  );
}
