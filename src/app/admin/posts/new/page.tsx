'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CreatePostRequest } from '@/types';
import { Category } from '@/types/blog';
import PostForm from '@/components/admin/PostForm';

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 카테고리 목록 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.categories.getList();
        setCategories(response);
      } catch (err) {
        console.error('카테고리 로딩 오류:', err);
        setError('카테고리를 불러오는 중 오류가 발생했습니다.');
      }
    };

    fetchCategories();
  }, []);

  // 게시글 저장
  const handleSubmit = async (formData: {
    title: string;
    content: string;
    summary: string;
    category: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const postData: CreatePostRequest = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        category: formData.category,
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

  // 초기 카테고리 값 설정
  const defaultCategory = categories.length > 0 ? categories[0].id : 1;
  
  return (
    <PostForm 
      initialValues={{
        title: '',
        content: '',
        summary: '',
        category: defaultCategory,
      }}
      categories={categories}
      isSubmitting={isLoading}
      error={error}
      pageTitle="새 게시글 작성"
      submitButtonText="저장"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
} 