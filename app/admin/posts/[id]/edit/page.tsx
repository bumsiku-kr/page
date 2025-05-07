'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import { Category, Post } from '../../../../types';

export default function EditPostPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  
  const router = useRouter();

  // 게시물 및 카테고리 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 게시물 정보 가져오기
        const postData = await api.posts.getOne(id);
        setPost(postData);
        setTitle(postData.title);
        setContent(postData.content);
        setSummary(postData.summary);
        setCategoryId(postData.category);
        
        // 카테고리 목록 가져오기
        const categories = await api.categories.getList();
        setCategories(categories);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('데이터 로드 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!categoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.posts.update(id, {
        title,
        content,
        summary,
        category: categoryId
      });
      router.push('/admin/posts');
    } catch (err) {
      console.error('게시물 수정 실패:', err);
      setError('게시물을 수정하는 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!post) {
    return <div className="p-6">게시물을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">게시물 수정</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* 제목 필드 */}
          <div className="sm:col-span-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              제목
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="게시물 제목을 입력하세요"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 카테고리 선택 */}
          <div className="sm:col-span-3">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              카테고리
            </label>
            <div className="mt-1">
              <select
                id="category"
                name="category"
                value={categoryId}
                onChange={(e) => setCategoryId(parseInt(e.target.value, 10))}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                disabled={isSubmitting}
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 요약 필드 */}
          <div className="sm:col-span-6">
            <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
              요약
            </label>
            <div className="mt-1">
              <textarea
                id="summary"
                name="summary"
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="게시물 요약을 입력하세요 (목록에 표시됩니다)"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* 내용 필드 */}
          <div className="sm:col-span-6">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              내용
            </label>
            <div className="mt-1">
              <textarea
                id="content"
                name="content"
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="게시물 내용을 입력하세요"
                disabled={isSubmitting}
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              마크다운 또는 HTML을 지원합니다.
            </p>
          </div>

          {/* 메타 정보 */}
          <div className="sm:col-span-6 border-t border-gray-200 pt-4 text-sm text-gray-500">
            <p>게시물 ID: {id}</p>
            <p>작성일: {post?.createdAt && new Date(post.createdAt).toLocaleDateString('ko-KR')}</p>
            <p>마지막 수정일: {post?.updatedAt && new Date(post.updatedAt).toLocaleDateString('ko-KR')}</p>
          </div>
        </div>

        <div className="pt-5 flex justify-end space-x-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
              isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                저장 중...
              </span>
            ) : (
              '저장하기'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 