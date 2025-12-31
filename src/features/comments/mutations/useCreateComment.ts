'use client';

import { useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { api } from '@/lib/api';
import type { Comment, CreateCommentRequest } from '@/types';

/**
 * Hook for creating a comment with optimistic update
 */
export function useCreateComment(postId: string) {
  const { mutate } = useSWRConfig();
  const numericPostId = parseInt(postId, 10);

  const createComment = useCallback(
    async (data: CreateCommentRequest): Promise<Comment> => {
      // Optimistic update: add temporary comment to cache
      const tempId = `temp-${Date.now()}`;
      const optimisticComment: Comment = {
        id: tempId,
        authorName: data.author,
        content: data.content,
        createdAt: new Date().toISOString(),
      };

      // Optimistically update the cache
      await mutate(
        ['comments', postId],
        (currentComments: Comment[] | undefined) => {
          return [...(currentComments || []), optimisticComment];
        },
        false
      );

      try {
        // Make the actual API call
        const newComment = await api.comments.create(numericPostId, data);

        // Update cache with the real comment
        await mutate(['comments', postId]);

        return newComment;
      } catch (error) {
        // Rollback on error
        await mutate(['comments', postId]);
        throw error;
      }
    },
    [postId, numericPostId, mutate]
  );

  return { createComment };
}
