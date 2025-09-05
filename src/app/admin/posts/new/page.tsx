'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CreatePostRequest } from '@/types';
import PostForm from '@/components/admin/PostForm';

export default function NewPostPage() {
  const router = useRouter();
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 태그 목록 불러오기 (추천용)
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.tags.getList();
        setExistingTags(response.map(t => t.name));
      } catch (err) {
        console.error('태그 로딩 오류:', err);
        setError('태그를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchTags();
  }, []);

  // 게시글 저장
  const handleSubmit = async (formData: {
    title: string;
    content: string;
    summary: string;
    tags: string[];
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const postData: CreatePostRequest = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        tags: formData.tags,
      };

      await api.posts.create(postData);
      router.push('/admin/posts');
    } catch (err) {
      console.error('게시글 저장 오류:', err);
      setError('게시글을 저장하는 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <PostForm
      initialValues={{
        title: '',
        content: '',
        summary: '',
        tags: [],
      }}
      existingTags={existingTags}
      isSubmitting={isLoading}
      error={error}
      pageTitle="새 게시글 작성"
      submitButtonText="저장"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
