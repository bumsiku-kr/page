'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { UpdatePostRequest, Post } from '@/types';
import PostForm from '@/components/admin/PostForm';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 게시글 데이터와 태그 목록 불러오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 게시글 데이터와 태그 목록을 병렬로 불러옴
        const [postData, tagsData] = await Promise.all([
          api.posts.getOne(parseInt(postId, 10)),
          api.tags.getList(),
        ]);

        setPost(postData);
        setExistingTags(tagsData.map(t => t.name));
        setError(null);
      } catch (err) {
        console.error('데이터 로딩 오류:', err);
        setError('게시글 또는 태그 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  // 게시글 수정
  const handleSubmit = async (formData: {
    title: string;
    slug: string;
    content: string;
    summary: string;
    tags: string[];
  }) => {
    setIsSaving(true);
    setError(null);

    try {
      const postData: UpdatePostRequest = {
        title: formData.title,
        slug: formData.slug,
        content: formData.content,
        summary: formData.summary,
        tags: formData.tags,
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
    return (
      <div className="flex justify-center items-center min-h-screen">
        게시글 정보를 불러오는 중...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        게시글을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <PostForm
      initialValues={{
        title: post.title,
        slug: post.slug,
        content: post.content,
        summary: post.summary,
        tags: post.tags || [],
      }}
      existingTags={existingTags}
      isSubmitting={isSaving}
      error={error}
      pageTitle="게시글 수정"
      submitButtonText="저장"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
}
