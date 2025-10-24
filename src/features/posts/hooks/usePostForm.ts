import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreatePostSchema, type CreatePostInput } from '@/shared/types/schemas';

/**
 * Hook for post form management with React Hook Form + Zod validation
 * Replaces complex useState chains with unified form state
 */
export function usePostForm(initialValues?: Partial<CreatePostInput>) {
  return useForm<CreatePostInput>({
    resolver: zodResolver(CreatePostSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      summary: '',
      tags: [],
      state: 'published', // Required by new backend
      ...initialValues,
    },
    mode: 'onBlur', // Validate on blur for better UX
  });
}

/**
 * Utility: Generate URL-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .trim()
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}
