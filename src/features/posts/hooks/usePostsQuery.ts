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
  sort: SortOption = 'views,desc',
  locale?: string
) {
  return useSWR(['posts', page, size, sort, locale], () =>
    api.posts.getList(page, size, undefined, sort, locale)
  );
}

/**
 * Hook for fetching posts by tag
 */
export function usePostsByTagQuery(
  tag: string,
  page: number = 0,
  size: number = 10,
  sort: SortOption = 'views,desc',
  locale?: string
) {
  return useSWR(tag ? ['posts', 'tag', tag, page, size, sort, locale] : null, () =>
    api.posts.getList(page, size, tag, sort, locale)
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
 * Hook for fetching all tags with post counts for a specific locale
 */
export function useTagsQuery(locale?: string) {
  return useSWR(['tags', locale], () => api.tags.getList(locale));
}
