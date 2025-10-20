import useSWR from 'swr';
import { api } from '@/lib/api';
import type { SortOption } from '@/types';

/**
 * Hook for fetching paginated posts with SWR
 * Provides automatic caching, revalidation, and error handling
 */
export function usePostsQuery(page: number = 0, sort: SortOption = 'createdAt,desc') {
  return useSWR(['posts', page, sort], () =>
    api.posts.getPosts({
      page,
      size: 10,
      sort,
    })
  );
}

/**
 * Hook for fetching posts by tag
 */
export function usePostsByTagQuery(tag: string, page: number = 0, sort: SortOption = 'createdAt,desc') {
  return useSWR(tag ? ['posts', 'tag', tag, page, sort] : null, () =>
    api.posts.getPostsByTag(tag, {
      page,
      size: 10,
      sort,
    })
  );
}

/**
 * Hook for fetching a single post by identifier (slug or ID)
 */
export function usePostQuery(identifier: string | number) {
  return useSWR(identifier ? ['post', identifier] : null, () => api.posts.getPost(String(identifier)));
}

/**
 * Hook for fetching all tags with post counts
 */
export function useTagsQuery() {
  return useSWR(['tags'], () => api.tags.getTags());
}
