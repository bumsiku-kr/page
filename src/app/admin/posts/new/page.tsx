'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import { Category } from '../../../../types';

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // 카테고리 목록 불러오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await api.categories.getList();
        setCategories(categories);

        // 첫 번째 카테고리를 기본값으로 설정
        if (categories.length > 0) {
          setCategoryId(categories[0].id);
        }
      } catch (err) {
        setError('카테고리를 불러오는 중 오류가 발생했습니다.');
        console.error('카테고리 목록 가져오기 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!categoryId) {
      setError('카테고리를 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.posts.create({
        title,
        content,
        summary,
        category: categoryId,
      });
      router.push('/admin/posts');
    } catch (err) {
      console.error('게시물 생성 실패:', err);
      setError('게시물을 생성하는 중 오류가 발생했습니다.');
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

  return (
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
              onChange={e => setTitle(e.target.value)}
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
              value={categoryId || ''}
              onChange={e => setCategoryId(parseInt(e.target.value, 10))}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              disabled={isSubmitting}
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map(cat => (
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
              onChange={e => setSummary(e.target.value)}
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
              onChange={e => setContent(e.target.value)}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="게시물 내용을 입력하세요"
              disabled={isSubmitting}
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">마크다운 또는 HTML을 지원합니다.</p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="sm:col-span-6">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="sm:col-span-6 flex justify-end space-x-3">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </form>
  );
}
