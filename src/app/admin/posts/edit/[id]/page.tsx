'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { UpdatePostRequest, Post } from '@/types';
import { Category } from '@/types/blog';
import PostForm from '@/components/admin/PostForm';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 게시글 데이터와 카테고리 목록 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 게시글 데이터와 카테고리 목록을 병렬로 불러옴
        const [postData, categoriesData] = await Promise.all([
          api.posts.getOne(parseInt(postId, 10)),
          api.categories.getList()
        ]);
        
        setPost(postData);
        setCategories(categoriesData);
        setError(null);
      } catch (err) {
        console.error('데이터 로딩 오류:', err);
        setError('게시글 또는 카테고리 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  // 게시글 수정
  const handleSubmit = async (formData: {
    title: string;
    content: string;
    summary: string;
    category: number;
  }) => {
    setIsSaving(true);
    setError(null);

    try {
      const postData: UpdatePostRequest = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary,
        category: formData.category,
      };

      await api.posts.update(parseInt(postId, 10), postData);
      router.push('/admin/posts');
    } catch (err) {
      console.error('게시글 수정 오류:', err);
      setError('게시글을 수정하는 중 오류가 발생했습니다.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">게시글 정보를 불러오는 중...</div>;
  }

  if (!post) {
    return <div className="flex justify-center items-center min-h-screen">게시글을 찾을 수 없습니다.</div>;
  }

  // 카테고리 ID 결정 로직
  const getCategoryId = () => {
    // 실제 API는 categoryId를 반환함
    if (post.categoryId && typeof post.categoryId === 'number') {
      return post.categoryId;
    }
    
    // 카테고리 정보가 없는 경우 첫 번째 카테고리 사용
    return categories.length > 0 ? categories[0].id : 1;
  };

  return (
    <PostForm 
      initialValues={{
        title: post.title,
        content: post.content,
        summary: post.summary,
        category: getCategoryId(),
      }}
      categories={categories}
      isSubmitting={isSaving}
      error={error}
      pageTitle="게시글 수정"
      submitButtonText="저장"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
} 