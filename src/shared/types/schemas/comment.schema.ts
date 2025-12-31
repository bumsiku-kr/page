import { z } from 'zod';

/**
 * Comment schema for runtime validation
 */
export const CommentSchema = z.object({
  id: z.string(),
  authorName: z.string().min(1, '작성자 이름은 필수입니다.'),
  content: z.string().min(1, '댓글 내용은 필수입니다.'),
  createdAt: z.string(),
  postId: z.number().optional(),
});

/**
 * Comment list schema
 */
export const CommentListSchema = z.array(CommentSchema);

/**
 * Create comment request schema
 */
export const CreateCommentRequestSchema = z.object({
  author: z.string().min(1, '작성자 이름은 필수입니다.').max(50, '작성자 이름은 50자 이내여야 합니다.'),
  content: z.string().min(1, '댓글 내용은 필수입니다.').max(1000, '댓글은 1000자 이내여야 합니다.'),
});

// Type exports
export type Comment = z.infer<typeof CommentSchema>;
export type CommentList = z.infer<typeof CommentListSchema>;
export type CreateCommentRequest = z.infer<typeof CreateCommentRequestSchema>;

/**
 * Validate comment
 */
export function validateComment(data: unknown): Comment | null {
  const result = CommentSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate comment list
 */
export function validateCommentList(data: unknown): Comment[] {
  if (!Array.isArray(data)) return [];

  return data
    .map(item => validateComment(item))
    .filter((comment): comment is Comment => comment !== null);
}
