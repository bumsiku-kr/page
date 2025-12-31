import useSWR from 'swr';
import { api } from '@/lib/api';

/**
 * Hook for fetching comments for a post with SWR
 * Provides automatic caching, revalidation, and error handling
 */
export function useCommentsQuery(postId: string) {
  const numericPostId = parseInt(postId, 10);

  return useSWR(
    postId ? ['comments', postId] : null,
    () => api.comments.getByPostId(numericPostId),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
}
