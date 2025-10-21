import useSWR from 'swr';
import { api } from '@/lib/api';
import type { SortOption } from '@/types';

/**
 * Hook for fetching paginated posts with SWR
 * Provides automatic caching, revalidation, and error handling
 */
export function usePostsQuery(
  page: number = 0,
  size: number = 10,
  sort: SortOption = 'createdAt,desc'
) {
  return useSWR(['posts', page, size, sort], () => api.posts.getList(page, size, undefined, sort));
}

/**
 * Hook for fetching posts by tag
 */
export function usePostsByTagQuery(
  tag: string,
  page: number = 0,
  size: number = 10,
  sort: SortOption = 'createdAt,desc'
) {
  return useSWR(tag ? ['posts', 'tag', tag, page, size, sort] : null, () =>
    api.posts.getList(page, size, tag, sort)
  );
}

/**
 * Hook for fetching a single post by slug
 */
export function usePostQuery(slug: string) {
  return useSWR(slug ? ['post', slug] : null, () => api.posts.getBySlug(slug));
}

/**
 * Hook for fetching a post by ID
 */
export function usePostByIdQuery(id: number) {
  return useSWR(id ? ['post', 'id', id] : null, () => api.posts.getOne(id));
}

/**
 * Hook for fetching all tags with post counts
 */
export function useTagsQuery() {
  return useSWR(['tags'], () => api.tags.getList());
}
