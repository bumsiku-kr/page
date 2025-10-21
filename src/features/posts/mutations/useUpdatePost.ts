import { useSWRConfig } from 'swr';
import { useCallback } from 'react';
import { api } from '@/lib/api';
import type { Post, PostListResponse, UpdatePostRequest } from '@/types';

/**
 * Mutation hook for updating a post with optimistic updates
 *
 * Optimistic update pattern:
 * 1. Update post in UI immediately
 * 2. Send update request to server
 * 3. On success: revalidate with server data
 * 4. On error: rollback to previous state
 *
 * @example
 * ```typescript
 * const updatePost = useUpdatePost();
 * await updatePost(123, { title: 'Updated Title' });
 * ```
 */
export function useUpdatePost() {
  const { mutate } = useSWRConfig();

  return useCallback(
    async (postId: number, updates: UpdatePostRequest) => {
      // Optimistically update single post
      mutate(
        ['post', postId],
        async (current?: Post) => {
          if (!current) return current;
          return {
            ...current,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        },
        false
      );

      // Optimistically update in all lists
      mutate(
        (key: unknown) => typeof key === 'string' && key.includes('posts'),
        async (current?: PostListResponse) => {
          if (!current) return current;
          return {
            ...current,
            content: current.content.map(post =>
              post.id === postId
                ? { ...post, ...updates, updatedAt: new Date().toISOString() }
                : post
            ),
          };
        },
        false
      );

      try {
        // Update on server
        const updatedPost = await api.posts.update(postId, updates);

        // Revalidate with server data
        await Promise.all([
          mutate(['post', postId]),
          mutate((key: unknown) => typeof key === 'string' && key.includes('posts')),
        ]);

        return updatedPost;
      } catch (error) {
        // Rollback on error
        await Promise.all([
          mutate(['post', postId]),
          mutate((key: unknown) => typeof key === 'string' && key.includes('posts')),
        ]);
        throw error;
      }
    },
    [mutate]
  );
}
