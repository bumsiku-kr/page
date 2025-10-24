'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/index';
import { PostForm } from '@/features/posts/components';
import type { CreatePostInput } from '@/shared/types/schemas';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function NewPostPage() {
  useAuthGuard(); // Protect this admin route
  const router = useRouter();
  const [existingTags, setExistingTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.tags.getList();
        setExistingTags(response.map(t => t.name));
      } catch (err) {
        console.error('태그 로딩 오류:', err);
      }
    };

    fetchTags();
  }, []);

  const handleSubmit = async (data: CreatePostInput) => {
    await api.posts.create(data);
    router.push('/admin/posts');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <PostForm
      initialValues={{
        title: '',
        slug: '',
        content: '',
        summary: '',
        tags: [],
        state: 'published', // Required by new backend
      }}
      existingTags={existingTags}
      pageTitle="새 게시글 작성"
      submitButtonText="저장"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
