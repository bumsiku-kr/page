import { useSWRConfig } from 'swr';
import { useCallback } from 'react';
import { api } from '@/lib/api';
import type { PostListResponse } from '@/types';

/**
 * Mutation hook for deleting a post with optimistic updates
 *
 * Optimistic delete pattern:
 * 1. Remove post from UI immediately
 * 2. Send delete request to server
 * 3. On success: keep optimistic state
 * 4. On error: rollback (restore deleted post)
 *
 * @example
 * ```typescript
 * const deletePost = useDeletePost();
 * await deletePost(123);
 * ```
 */
export function useDeletePost() {
  const { mutate } = useSWRConfig();

  return useCallback(
    async (postId: number) => {
      // Optimistically remove post from all lists
      await mutate(
        (key: unknown) => typeof key === 'string' && key.includes('posts'),
        async (current?: PostListResponse) => {
          if (!current) return current;

          // Remove post
          return {
            ...current,
            content: current.content.filter(p => p.id !== postId),
            totalElements: current.totalElements - 1,
          };
        },
        false // Don't revalidate yet
      );

      try {
        // Delete on server
        await api.posts.delete(postId);

        // Revalidate to ensure consistency
        await mutate((key: unknown) => typeof key === 'string' && key.includes('posts'));
      } catch (error) {
        // Rollback on error - revalidate to restore server state
        await mutate((key: unknown) => typeof key === 'string' && key.includes('posts'));
        throw error;
      }
    },
    [mutate]
  );
}
