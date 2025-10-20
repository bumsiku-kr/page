'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/index';
import { CreatePostRequest } from '@/types';
import VelogWriteEditor from '@/components/admin/VelogWriteEditor';

export default function WritePostPage() {
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
  const handleSave = async (formData: {
    title: string;
    content: string;
    tags: string[];
    summary: string;
    slug: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const postData: CreatePostRequest = {
        title: formData.title,
        slug: formData.slug,
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <VelogWriteEditor
      initialValues={{
        title: '',
        content: '',
        tags: [],
      }}
      existingTags={existingTags}
      isSubmitting={isLoading}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
