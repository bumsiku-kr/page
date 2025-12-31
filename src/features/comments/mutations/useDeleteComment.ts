'use client';

import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { api } from '@/lib/api';
import type { Comment } from '@/types';

/**
 * Hook for deleting a comment with optimistic update
 */
export function useDeleteComment(postId: string) {
  const { mutate } = useSWRConfig();

  const deleteComment = useCallback(
    async (commentId: string): Promise<void> => {
      // Optimistically remove from cache
      await mutate(
        ['comments', postId],
        (currentComments: Comment[] | undefined) => {
          return (currentComments || []).filter((c) => c.id !== commentId);
        },
        false
      );

      try {
        // Make the actual API call
        await api.comments.delete(commentId);

        // Revalidate cache
        await mutate(['comments', postId]);
      } catch (error) {
        // Rollback on error
        await mutate(['comments', postId]);
        throw error;
      }
    },
    [postId, mutate]
  );

  return { deleteComment };
}
