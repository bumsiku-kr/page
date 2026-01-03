import useSWR from 'swr';
import { api } from '@/lib/api';

/**
 * Hook for fetching paginated admin posts with SWR
 * Returns all posts including draft and scheduled posts
 * The backend automatically determines 'scheduled' state based on createdAt > now
 */
export function useAdminPostsQuery(
  page: number = 0,
  size: number = 10,
  sort: string = 'createdAt,desc'
) {
  return useSWR(['admin-posts', page, size, sort], () =>
    api.posts.getAdminList(page, size, sort)
  );
}
